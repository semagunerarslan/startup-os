/* 
   StartUp OS - LaunchFlow Gantt Şeması Motoru (Chart.js Tabanlı Grafik Çözümü)
   Süreç Odaklı (Aşama Bazlı) ve Ekip Odaklı (Kişi Bazlı) Çift Görünüm Desteği
   Dinamik Tarih Hesaplama, Günlük/Haftalık/Saatlik Görünüm ve Grafiksel Vurgulamalar
*/

class GanttChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.zoomMode = "weeks"; // "weeks", "days" veya "hours"
        this.groupBy = "phases"; // "phases" veya "team"
        this.highlightCriticalPath = false;
        
        // Zaman çizelgesi sınırları
        this.startDate = new Date("2026-06-01");
        this.endDate = new Date("2026-08-15");
        
        this.chartInstance = null;
        
        this.initEventListeners();
    }

    initEventListeners() {
        const btnWeeks = document.getElementById("gantt-zoom-weeks");
        const btnDays = document.getElementById("gantt-zoom-days");
        const btnHours = document.getElementById("gantt-zoom-hours");
        const btnCritical = document.getElementById("btn-toggle-critical-path");
        
        const btnPhases = document.getElementById("gantt-view-phases");
        const btnTeam = document.getElementById("gantt-view-team");

        // Ölçek Değiştirme
        if (btnWeeks && btnDays) {
            btnWeeks.addEventListener("click", () => {
                this.setZoomMode("weeks");
                btnWeeks.classList.add("active");
                btnDays.classList.remove("active");
                if (btnHours) btnHours.classList.remove("active");
            });

            btnDays.addEventListener("click", () => {
                this.setZoomMode("days");
                btnDays.classList.add("active");
                btnWeeks.classList.remove("active");
                if (btnHours) btnHours.classList.remove("active");
            });
        }

        if (btnHours) {
            btnHours.addEventListener("click", () => {
                this.setZoomMode("hours");
                btnHours.classList.add("active");
                btnWeeks.classList.remove("active");
                btnDays.classList.remove("active");
            });
        }

        // Görünüm Grubu Değiştirme
        if (btnPhases && btnTeam) {
            btnPhases.addEventListener("click", () => {
                this.groupBy = "phases";
                btnPhases.classList.add("active");
                btnTeam.classList.remove("active");
                this.render();
            });

            btnTeam.addEventListener("click", () => {
                this.groupBy = "team";
                btnTeam.classList.add("active");
                btnPhases.classList.remove("active");
                this.render();
            });
        }

        // Kritik Yol
        if (btnCritical) {
            btnCritical.addEventListener("click", () => {
                this.highlightCriticalPath = !this.highlightCriticalPath;
                btnCritical.classList.toggle("active", this.highlightCriticalPath);
                this.render();
            });
        }
    }

    setZoomMode(mode) {
        this.zoomMode = mode;
        this.render();
    }

    // İki tarih arasındaki gün sayısını hesaplar
    getDaysDifference(d1, d2) {
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateTimelineRange(tasks) {
        if (this.zoomMode === "hours") {
            // Saatlik görünümde simüle edilen bugün (11 Haziran 2026) civarına odaklan
            // 8 Haziran Pazartesi - 14 Haziran Pazar (7 günlük bir pencere)
            this.startDate = new Date("2026-06-08T00:00:00");
            this.endDate = new Date("2026-06-14T23:59:59");
            return;
        }

        if (!tasks || tasks.length === 0) {
            this.startDate = new Date("2026-06-01");
            this.endDate = new Date("2026-08-15");
            return;
        }

        let minDate = new Date(tasks[0].startDate);
        let maxDate = new Date(tasks[0].endDate);

        tasks.forEach(t => {
            const start = new Date(t.startDate);
            const end = new Date(t.endDate);
            if (start < minDate) minDate = start;
            if (end > maxDate) maxDate = end;
        });

        // 3 gün başlangıç ve 7 gün bitiş tamponu ekle
        minDate.setDate(minDate.getDate() - 3);
        maxDate.setDate(maxDate.getDate() + 7);

        this.startDate = minDate;
        this.endDate = maxDate;
    }

    render() {
        if (!this.container) return;
        
        const tasks = window.App ? window.App.tasks : [];
        const phases = window.App ? window.App.phases : DEFAULT_PHASES;
        const teamMembers = window.App ? window.App.teamMembers : DEFAULT_TEAM_MEMBERS;
        
        // Dinamik takvim aralığını güncelle
        this.calculateTimelineRange(tasks);

        const displayStart = this.startDate.getTime();
        const displayEnd = this.endDate.getTime();

        // Sadece görünür tarih aralığıyla kesişen görevleri göster (özellikle saatlik zumda boş satırları önler)
        const visibleTasks = tasks.filter(t => {
            const tStart = new Date(t.startDate).getTime();
            const tEnd = new Date(t.endDate).getTime();
            return tStart <= displayEnd && tEnd >= displayStart;
        });

        // Görevleri gruplama tipine göre sırala
        let tasksToDisplay = [];
        if (this.groupBy === "phases") {
            phases.forEach(phase => {
                const phaseTasks = visibleTasks.filter(t => t.phaseId === phase.id);
                phaseTasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                tasksToDisplay.push(...phaseTasks);
            });
        } else {
            teamMembers.forEach(member => {
                const memberTasks = visibleTasks.filter(t => t.assignee === member.name);
                memberTasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                tasksToDisplay.push(...memberTasks);
            });
        }

        if (tasksToDisplay.length === 0) {
            this.container.innerHTML = "<div class='text-muted' style='padding:40px; text-align:center;'>Bu tarih aralığında aktif görev bulunmuyor.</div>";
            return;
        }

        // Yükseklik ayarını dinamik yap (Görev başına ~38px + başlık/boşluk)
        const dynamicHeight = Math.max(450, tasksToDisplay.length * 38 + 80);
        this.container.style.height = `${dynamicHeight}px`;

        // Canvas elementini kontrol et veya oluştur
        let canvas = document.getElementById("gantt-chart-canvas");
        if (!canvas) {
            this.container.innerHTML = "";
            canvas = document.createElement("canvas");
            canvas.id = "gantt-chart-canvas";
            this.container.appendChild(canvas);
        }

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Renk Paleti ve Sınırlar
        const COLOR_MAP = {
            purple: { bg: 'rgba(139, 92, 246, 0.7)', border: 'rgb(139, 92, 246)' },
            blue: { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgb(59, 130, 246)' },
            green: { bg: 'rgba(16, 185, 129, 0.7)', border: 'rgb(16, 185, 129)' },
            rose: { bg: 'rgba(244, 63, 94, 0.7)', border: 'rgb(244, 63, 94)' },
            warning: { bg: 'rgba(245, 158, 11, 0.7)', border: 'rgb(245, 158, 11)' }
        };

        const getMappingColor = (colorName) => {
            return COLOR_MAP[colorName] || COLOR_MAP.purple;
        };

        const backgroundColors = [];
        const borderColors = [];
        const borderWidths = [];

        // Y-ekseni grup etiketlerini oluştur (Grup değiştikçe ismi yaz, aynı grupta boş bırak)
        let lastGroupLabel = "";
        const labels = tasksToDisplay.map((t, idx) => {
            let groupLabel = "";
            if (this.groupBy === "phases") {
                const phase = phases.find(p => p.id === t.phaseId);
                groupLabel = phase ? phase.name : "Diğer";
            } else {
                groupLabel = t.assignee;
            }

            let tickLabel = "";
            if (groupLabel !== lastGroupLabel) {
                tickLabel = groupLabel;
                lastGroupLabel = groupLabel;
            } else {
                tickLabel = ""; // Gruplanmış alt satırlar için boş etiket
            }

            // Chart.js için her etiketi benzersiz kıl
            return tickLabel + "\u200B".repeat(idx);
        });

        const dataRanges = tasksToDisplay.map(t => {
            const startMs = new Date(t.startDate).getTime();
            const endMs = new Date(t.endDate).getTime();
            return [startMs, endMs];
        });

        tasksToDisplay.forEach(t => {
            // Kritik yol kontrolü
            if (this.highlightCriticalPath && t.onCriticalPath) {
                backgroundColors.push('rgba(244, 63, 94, 0.85)'); // Canlı kırmızı
                borderColors.push('rgb(244, 63, 94)');
                borderWidths.push(2);
            } else {
                let colorName = "purple";
                if (this.groupBy === "phases") {
                    const phase = phases.find(p => p.id === t.phaseId);
                    if (phase) colorName = phase.color;
                } else {
                    const member = teamMembers.find(m => m.name === t.assignee);
                    if (member) colorName = member.color;
                }
                const mapped = getMappingColor(colorName);
                backgroundColors.push(mapped.bg);
                borderColors.push(mapped.border);
                borderWidths.push(1);
            }
        });

        // X Ekseni kırılım adımı (Zoom ayarı)
        let tickStepSize = 7 * 24 * 60 * 60 * 1000; // Varsayılan Haftalık
        if (this.zoomMode === "days") {
            tickStepSize = 2 * 24 * 60 * 60 * 1000;
        } else if (this.zoomMode === "hours") {
            tickStepSize = 12 * 60 * 60 * 1000; // 12 saatlik adımlar
        }

        // Custom Plugin: Görev Başlıklarını Bar Üstüne veya Yanına Yazma
        const customGanttLabelsPlugin = {
            id: 'customGanttLabels',
            afterDatasetsDraw: (chart) => {
                const { ctx, chartArea } = chart;
                ctx.save();
                
                const meta = chart.getDatasetMeta(0);
                meta.data.forEach((bar, index) => {
                    const task = tasksToDisplay[index];
                    if (!task) return;
                    
                    const { x, y, width } = bar.getProps(['x', 'y', 'width'], true);
                    
                    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
                    
                    // Ekip görünümünde aşamayı, süreç görünümünde sorumlu kişiyi ek bilgi olarak yaz
                    let text = task.title;
                    if (this.groupBy === "team") {
                        const phase = phases.find(p => p.id === task.phaseId);
                        const phaseName = phase ? phase.name : "";
                        text = `${task.title} (${phaseName})`;
                    } else {
                        text = `${task.title} (${task.assignee})`;
                    }

                    const textWidth = ctx.measureText(text).width;
                    const barEnd = x;
                    const barStart = x - width;
                    const spaceToRight = chartArea.right - barEnd;

                    if (width > textWidth + 16) {
                        // Bar içine sığıyorsa: Bar içine beyaz renkte ortala
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(text, barStart + width / 2, y);
                    } else if (spaceToRight > textWidth + 16) {
                        // Sığmıyor ama sağda yer varsa: Barın sağına yaz
                        ctx.fillStyle = '#e2e8f0';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(text, barEnd + 8, y);
                    } else {
                        // Sağda yer yoksa: Barın soluna yaz (taşıp kırpılmayı engelle)
                        ctx.fillStyle = '#e2e8f0';
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(text, barStart - 8, y);
                    }
                });
                ctx.restore();
            }
        };

        this.chartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Süreç Zamanı',
                    data: dataRanges,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: borderWidths,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.65
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#111827',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        usePointStyle: true,
                        callbacks: {
                            title: function(context) {
                                const idx = context[0].dataIndex;
                                const task = tasksToDisplay[idx];
                                return task ? task.title : "";
                            },
                            label: function(context) {
                                const idx = context.dataIndex;
                                const task = tasksToDisplay[idx];
                                if (!task) return "";
                                
                                const startFormatted = new Date(task.startDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
                                const endFormatted = new Date(task.endDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
                                
                                const phase = phases.find(p => p.id === task.phaseId);
                                const phaseName = phase ? phase.name : "Planlama";
                                
                                let statusText = "Yapılacak";
                                if (task.status === "Done") statusText = "Tamamlandı";
                                else if (task.status === "In Progress") statusText = "Yapılıyor";

                                return [
                                    `Sorumlu: ${task.assignee}`,
                                    `Aşama: ${phaseName}`,
                                    `Başlangıç: ${startFormatted}`,
                                    `Bitiş: ${endFormatted}`,
                                    `Durum: ${statusText}`,
                                    `Efor: ${task.loggedHours || 0} / ${task.estimatedHours} Saat`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: this.startDate.getTime(),
                        max: this.endDate.getTime(),
                        grid: {
                            color: 'rgba(255, 255, 255, 0.04)',
                            borderColor: 'rgba(255, 255, 255, 0.08)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                family: "'Plus Jakarta Sans', sans-serif",
                                size: 10
                            },
                            callback: (value) => {
                                const date = new Date(value);
                                if (this.zoomMode === "hours") {
                                    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) + " " + 
                                           date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                                }
                                return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                            },
                            stepSize: tickStepSize
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.03)',
                            borderColor: 'rgba(255, 255, 255, 0.06)'
                        },
                        ticks: {
                            color: '#e2e8f0',
                            font: {
                                family: "'Plus Jakarta Sans', sans-serif",
                                weight: '700',
                                size: 11
                            },
                            callback: function(value, index) {
                                // Sıfır genişlikli boşlukları kaldırıp temiz isim göster
                                const fullLabel = this.getLabelForValue(index);
                                return fullLabel ? fullLabel.replace(/\u200B/g, '') : '';
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements && elements.length > 0) {
                        const idx = elements[0].index;
                        const task = tasksToDisplay[idx];
                        if (task && window.App && typeof window.App.openTaskModal === "function") {
                            window.App.openTaskModal(task.id);
                        }
                    }
                }
            },
            plugins: [customGanttLabelsPlugin]
        });
    }
}
