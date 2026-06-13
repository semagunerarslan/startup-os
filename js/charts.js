/* 
   StartUp OS - LaunchFlow Grafik Entegrasyon Motoru
   Chart.js ile Karşılaştırmalı Saatlik, Çift Eksenli Günlük ve Yığılmış (Stacked) Haftalık/Aylık Grafikler
   Koyu Tema Renk Uyumları ve Yumuşak Neon Animasyonlar
*/

class AnalyticsCharts {
    constructor() {
        this.instances = {
            dashFinance: null,
            dashHours: null,
            hourly: null,
            daily: null,
            weeklyMonthly: null,
            taskHours: null
        };
        
        this.progressViewMode = "weekly"; // "weekly" veya "monthly"
        
        // Simüle edilen tarihler (Veri setiyle uyumlu: 11 Haziran 2026)
        this.todayStr = "2026-06-11";
        this.yesterdayStr = "2026-06-10";

        this.initEventListeners();
    }

    initEventListeners() {
        // İlerleme Grafiği Filtreleri
        const btnWeekly = document.getElementById("btn-chart-weekly");
        const btnMonthly = document.getElementById("btn-chart-monthly");

        if (btnWeekly && btnMonthly) {
            btnWeekly.addEventListener("click", () => {
                this.progressViewMode = "weekly";
                btnWeekly.classList.add("active");
                btnMonthly.classList.remove("active");
                this.updateWeeklyMonthlyChart();
            });
            btnMonthly.addEventListener("click", () => {
                this.progressViewMode = "monthly";
                btnMonthly.classList.add("active");
                btnWeekly.classList.remove("active");
                this.updateWeeklyMonthlyChart();
            });
        }
    }

    // Chart.js Global Ayarları (Dark Theme Uyumlu)
    getChartDefaults() {
        return {
            color: '#94a3b8', // text-muted
            font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc',
                        font: { weight: '600', size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: '#111827',
                    titleColor: '#f8fafc',
                    bodyColor: '#f8fafc',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    usePointStyle: true
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        };
    }

    // 1. Dashboard Bütçe Dağılım Grafiği (Doughnut)
    renderDashboardFinanceChart(transactions) {
        const ctx = document.getElementById("chart-dashboard-finance");
        if (!ctx) return;

        if (this.instances.dashFinance) {
            this.instances.dashFinance.destroy();
        }

        const categories = {
            Legal: { label: "Resmi/Yasal", amount: 0, color: "#3b82f6" },
            Office: { label: "Ofis/Kira", amount: 0, color: "#10b981" },
            Hardware: { label: "Donanım", amount: 0, color: "#f59e0b" },
            Software: { label: "Yazılım", amount: 0, color: "#8b5cf6" },
            Marketing: { label: "Pazarlama", amount: 0, color: "#f43f5e" },
            HR: { label: "İK/Ekip", amount: 0, color: "#a78bfa" },
            Other: { label: "Diğer", amount: 0, color: "#64748b" }
        };

        const expenses = transactions.filter(t => t.type === "Expense");
        expenses.forEach(t => {
            if (categories[t.category]) {
                categories[t.category].amount += t.amount;
            } else {
                categories.Other.amount += t.amount;
            }
        });

        const labels = [];
        const data = [];
        const colors = [];

        Object.values(categories).forEach(cat => {
            if (cat.amount > 0) {
                labels.push(cat.label);
                data.push(cat.amount);
                colors.push(cat.color);
            }
        });

        if (data.length === 0) {
            labels.push("Gider Yok");
            data.push(1);
            colors.push("rgba(255,255,255,0.05)");
        }

        this.instances.dashFinance = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1,
                    borderColor: "#121824"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right",
                        labels: {
                            color: '#94a3b8',
                            boxWidth: 12,
                            font: { size: 10 }
                        }
                    }
                },
                cutout: "70%"
            }
        });
    }

    // 2. Dashboard Haftalık Çalışma Kaydı (Mini Bar)
    renderProductivityCharts(timelogs) {
        const dashCtx = document.getElementById("chart-dashboard-hours");
        const dailyCtx = document.getElementById("chart-daily-productivity");
        
        if (!dashCtx && !dailyCtx) return;

        // Son 7 günün tarih listesini çıkar
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(this.todayStr);
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split("T")[0]);
        }

        // Gün bazlı toplam çalışma saatlerini hesapla
        const hoursPerDay = days.map(day => {
            const dayLogs = timelogs.filter(log => log.date === day);
            return dayLogs.reduce((sum, log) => sum + log.duration, 0);
        });

        // Gün bazlı tamamlanan görev sayısını hesapla (grafikleri doldurmak için)
        // Eğer görev o gün tamamlanmışsa
        const tasks = window.App ? window.App.tasks : [];
        const completedTasksPerDay = days.map(day => {
            const completedOnDay = tasks.filter(t => t.status === "Done" && t.endDate === day);
            return completedOnDay.length;
        });

        const dayLabels = days.map(day => {
            const d = new Date(day);
            return d.toLocaleDateString("tr-TR", { weekday: "short" });
        });

        // A. Dashboard Mini Bar Çizimi
        if (dashCtx) {
            if (this.instances.dashHours) this.instances.dashHours.destroy();
            
            this.instances.dashHours = new Chart(dashCtx, {
                type: "bar",
                data: {
                    labels: dayLabels,
                    datasets: [{
                        label: "Saat",
                        data: hoursPerDay,
                        backgroundColor: "rgba(139, 92, 246, 0.65)",
                        borderColor: "var(--primary-light)",
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 9 } } },
                        y: { grid: { color: 'rgba(255,255,255,0.02)' }, ticks: { color: '#94a3b8', font: { size: 9 } } }
                    }
                }
            });
        }

        // B. Zaman Grafikleri Sayfası - Çift Eksenli (Dual Axis) Gelişmiş Üretkenlik Grafiği
        if (dailyCtx) {
            if (this.instances.daily) this.instances.daily.destroy();

            const defaults = this.getChartDefaults();

            // Gradyan arkaplanlar oluştur
            const canvas = dailyCtx;
            const ctx = canvas.getContext("2d");
            const purpleGradient = ctx.createLinearGradient(0, 0, 0, 300);
            purpleGradient.addColorStop(0, "rgba(139, 92, 246, 0.4)");
            purpleGradient.addColorStop(1, "rgba(139, 92, 246, 0.0)");

            this.instances.daily = new Chart(dailyCtx, {
                data: {
                    labels: dayLabels,
                    datasets: [
                        {
                            type: "bar",
                            label: "Kayıtlı Çalışma Saati (Sol Eksen)",
                            data: hoursPerDay,
                            backgroundColor: "rgba(139, 92, 246, 0.35)",
                            borderColor: "var(--primary-light)",
                            borderWidth: 2,
                            borderRadius: 6,
                            yAxisID: "y"
                        },
                        {
                            type: "line",
                            label: "Tamamlanan Görev Sayısı (Sağ Eksen)",
                            data: completedTasksPerDay,
                            borderColor: "var(--success-light)",
                            backgroundColor: "rgba(16, 185, 129, 0.05)",
                            borderWidth: 3,
                            fill: false,
                            tension: 0.3,
                            pointBackgroundColor: "var(--success)",
                            pointHoverBackgroundColor: "#fff",
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            yAxisID: "y1"
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: defaults.plugins,
                    scales: {
                        x: defaults.scales.x,
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            grid: { color: 'rgba(255,255,255,0.03)' },
                            ticks: { color: '#94a3b8' },
                            title: { display: true, text: 'Saat', color: '#94a3b8' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: { drawOnChartArea: false }, // Sol eksen ızgarasını kullan
                            ticks: { color: '#94a3b8', precision: 0 },
                            title: { display: true, text: 'Görev Sayısı', color: '#94a3b8' }
                        }
                    }
                }
            });
        }
    }

    // 3. Karşılaştırmalı Saatlik Çalışma Grafiği (Çift Line Overlapping)
    updateHourlyChart() {
        const ctx = document.getElementById("chart-hourly-activity");
        if (!ctx) return;

        if (this.instances.hourly) this.instances.hourly.destroy();

        const timelogs = window.App ? window.App.timelogs : [];

        // Saat dilimleri: 08:00 - 20:00 (İş saatleri)
        const hourBins = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        
        // Bugünün saatlik logları (11 Haz)
        const todayHours = hourBins.map(hour => {
            const logs = timelogs.filter(log => log.date === this.todayStr && log.hourOfDay === hour);
            return logs.reduce((sum, log) => sum + log.duration, 0);
        });

        // Dünün saatlik logları (10 Haz)
        const yesterdayHours = hourBins.map(hour => {
            const logs = timelogs.filter(log => log.date === this.yesterdayStr && log.hourOfDay === hour);
            return logs.reduce((sum, log) => sum + log.duration, 0);
        });

        const hourLabels = hourBins.map(h => `${h}:00`);
        const defaults = this.getChartDefaults();

        // Canvas gradyanları
        const drawCtx = ctx.getContext("2d");
        
        const blueGrad = drawCtx.createLinearGradient(0, 0, 0, 300);
        blueGrad.addColorStop(0, "rgba(59, 130, 246, 0.2)");
        blueGrad.addColorStop(1, "rgba(59, 130, 246, 0.0)");

        const purpleGrad = drawCtx.createLinearGradient(0, 0, 0, 300);
        purpleGrad.addColorStop(0, "rgba(139, 92, 246, 0.15)");
        purpleGrad.addColorStop(1, "rgba(139, 92, 246, 0.0)");

        this.instances.hourly = new Chart(ctx, {
            type: "line",
            data: {
                labels: hourLabels,
                datasets: [
                    {
                        label: "Bugün (11 Haziran)",
                        data: todayHours,
                        borderColor: "var(--secondary-light)",
                        backgroundColor: blueGrad,
                        borderWidth: 3.5,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: "var(--secondary)",
                        pointHoverBackgroundColor: "#fff",
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: "Dün (10 Haziran)",
                        data: yesterdayHours,
                        borderColor: "rgba(139, 92, 246, 0.7)",
                        backgroundColor: purpleGrad,
                        borderWidth: 2.5,
                        borderDash: [6, 4],
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: "var(--primary)",
                        pointHoverBackgroundColor: "#fff",
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: defaults.plugins,
                scales: defaults.scales
            }
        });
    }

    // 4. Haftalık & Aylık Yığılmış (Stacked) İlerleme Durum Grafiği
    updateWeeklyMonthlyChart() {
        const ctx = document.getElementById("chart-weekly-monthly-progress");
        if (!ctx) return;

        if (this.instances.weeklyMonthly) this.instances.weeklyMonthly.destroy();

        const tasks = window.App ? window.App.tasks : [];
        const defaults = this.getChartDefaults();

        let labels = [];
        let todoData = [];
        let inProgressData = [];
        let doneData = [];

        if (this.progressViewMode === "weekly") {
            // Haftalık Stacked Görünüm (13 Haftalık Zaman Dilimi)
            const timelineStart = new Date("2026-06-01");
            const totalWeeks = 13;

            for (let w = 0; w < totalWeeks; w++) {
                labels.push(`${w + 1}. Hafta`);
                
                const wStart = new Date(timelineStart);
                wStart.setDate(timelineStart.getDate() + (w * 7));
                const wEnd = new Date(wStart);
                wEnd.setDate(wStart.getDate() + 6);

                const weeklyTasks = tasks.filter(task => {
                    const taskEnd = new Date(task.endDate);
                    return taskEnd >= wStart && taskEnd <= wEnd;
                });

                const todo = weeklyTasks.filter(t => t.status === "To Do").length;
                const inProgress = weeklyTasks.filter(t => t.status === "In Progress").length;
                const done = weeklyTasks.filter(t => t.status === "Done").length;

                todoData.push(todo);
                inProgressData.push(inProgress);
                doneData.push(done);
            }
        } else {
            // Aylık Stacked Görünüm
            labels = ["Haziran 2026", "Temmuz 2026", "Ağustos 2026"];
            
            const monthRanges = [
                { start: "2026-06-01", end: "2026-06-30" },
                { start: "2026-07-01", end: "2026-07-31" },
                { start: "2026-08-01", end: "2026-08-31" }
            ];

            monthRanges.forEach(range => {
                const start = new Date(range.start);
                const end = new Date(range.end);

                const monthlyTasks = tasks.filter(task => {
                    const taskEnd = new Date(task.endDate);
                    return taskEnd >= start && taskEnd <= end;
                });

                const todo = monthlyTasks.filter(t => t.status === "To Do").length;
                const inProgress = monthlyTasks.filter(t => t.status === "In Progress").length;
                const done = monthlyTasks.filter(t => t.status === "Done").length;

                todoData.push(todo);
                inProgressData.push(inProgress);
                doneData.push(done);
            });
        }

        this.instances.weeklyMonthly = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Tamamlanan (Done)",
                        data: doneData,
                        backgroundColor: "rgba(16, 185, 129, 0.75)",
                        borderColor: "var(--success-light)",
                        borderWidth: 1,
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }
                    },
                    {
                        label: "Yapılıyor (In Progress)",
                        data: inProgressData,
                        backgroundColor: "rgba(59, 130, 246, 0.75)",
                        borderColor: "var(--secondary-light)",
                        borderWidth: 1,
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }
                    },
                    {
                        label: "Yapılacak (To Do)",
                        data: todoData,
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        borderColor: "rgba(255, 255, 255, 0.12)",
                        borderWidth: 1,
                        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 } // Sadece en üsttekine köşe yuvarlatması ver
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: defaults.plugins,
                scales: {
                    x: {
                        stacked: true,
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        stacked: true,
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#94a3b8', precision: 0 },
                        title: { display: true, text: 'Görev Sayısı', color: '#94a3b8' }
                    }
                }
            }
        });
    }

    renderAll(tasks, transactions, timelogs) {
        this.renderDashboardFinanceChart(transactions);
        this.renderProductivityCharts(timelogs);
        this.updateHourlyChart();
        this.updateWeeklyMonthlyChart();
        this.renderTaskHoursChart(tasks);
    }

    renderTaskHoursChart(tasks) {
        const ctx = document.getElementById("chart-task-hours");
        if (!ctx) return;

        if (this.instances.taskHours) {
            this.instances.taskHours.destroy();
        }

        // Harcanan saati 0'dan büyük olan görevleri al
        let tasksWithHours = tasks.filter(t => (t.loggedHours || 0) > 0);
        
        // Eğer harcanan saati olan görev yoksa, ilk 6 görevi varsayılan eforla gösterelim
        if (tasksWithHours.length === 0) {
            tasksWithHours = tasks.slice(0, 6);
        }

        // Harcanan saate göre azalan sırala
        tasksWithHours.sort((a, b) => (b.loggedHours || 0) - (a.loggedHours || 0));

        const labels = tasksWithHours.map(t => t.title.length > 25 ? t.title.substring(0, 25) + "..." : t.title);
        const data = tasksWithHours.map(t => t.loggedHours || 0);

        const defaults = this.getChartDefaults();

        // Custom Tooltip callback to show assignee and date range
        const customTooltipOptions = {
            ...defaults.plugins.tooltip,
            callbacks: {
                title: function(context) {
                    const idx = context[0].dataIndex;
                    const task = tasksWithHours[idx];
                    return task ? task.title : "";
                },
                label: function(context) {
                    const idx = context.dataIndex;
                    const task = tasksWithHours[idx];
                    if (!task) return "";
                    
                    const startFormatted = new Date(task.startDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                    const endFormatted = new Date(task.endDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                    
                    return [
                        `Harcanan Süre: ${task.loggedHours || 0} Saat`,
                        `Tahmini Süre: ${task.estimatedHours || 0} Saat`,
                        `Sorumlu: ${task.assignee}`,
                        `Zaman Aralığı: ${startFormatted} - ${endFormatted}`,
                        `Durum: ${task.status === "Done" ? "Tamamlandı" : task.status === "In Progress" ? "Yapılıyor" : "Bekliyor"}`
                    ];
                }
            }
        };

        const drawCtx = ctx.getContext("2d");
        const gradient = drawCtx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(244, 63, 94, 0.45)");
        gradient.addColorStop(1, "rgba(244, 63, 94, 0.0)");

        this.instances.taskHours = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Harcanan Süre (Saat)",
                    data: data,
                    backgroundColor: gradient,
                    borderColor: "var(--danger-light)",
                    borderWidth: 2,
                    borderRadius: 6,
                    barPercentage: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...defaults.plugins,
                    tooltip: customTooltipOptions
                },
                scales: {
                    x: defaults.scales.x,
                    y: {
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#94a3b8' },
                        title: { display: true, text: 'Harcanan Saat', color: '#94a3b8' }
                    }
                }
            }
        });
    }
}
