/* 
   StartUp OS - LaunchFlow Ana Uygulama Kontrolcüsü (App Controller)
   SPA Yönlendirmesi, LocalStorage Durum Senkronizasyonu, Görev ve Finans Ekleme/Düzenleme/Silme Mantığı
*/

class StartupApp {
    constructor() {
        window.App = this;
        this.phases = [];
        this.tasks = [];
        this.transactions = [];
        this.timelogs = [];

        this.initData();
        this.initModules();
        this.initGlobalEvents();
        this.initStopwatch();
        
        // İlk yükleme ve hesaplamalar
        this.saveAndRefresh();
        
        // URL hash yönlendirmesini kontrol et
        this.handleRouting();
    }

    // Verileri LocalStorage veya data.js varsayılanlarından yükle
    initData() {
        this.phases = DEFAULT_PHASES; // Aşamalar sabittir

        const localTasks = localStorage.getItem("startup_tasks");
        const localTrans = localStorage.getItem("startup_transactions");
        const localLogs = localStorage.getItem("startup_timelogs");
        const localTeam = localStorage.getItem("startup_team_members");

        let forceReset = false;
        if (localTeam) {
            try {
                const team = JSON.parse(localTeam);
                if (team.some(m => m.name === "Kurucu")) {
                    forceReset = true;
                }
            } catch (e) {
                forceReset = true;
            }
        }

        // Eğer görevlerin sayısı DEFAULT_TASKS'tan küçükse veya t8_3 görevi yoksa otomatik güncelle/göç ettir
        if (localTasks && !forceReset) {
            try {
                const tasks = JSON.parse(localTasks);
                if (tasks.length < DEFAULT_TASKS.length || !tasks.some(t => t.id === "t8_3")) {
                    forceReset = true;
                }
            } catch (e) {
                forceReset = true;
            }
        }

        if (forceReset) {
            localStorage.removeItem("startup_tasks");
            localStorage.removeItem("startup_transactions");
            localStorage.removeItem("startup_timelogs");
            localStorage.removeItem("startup_team_members");
            this.tasks = DEFAULT_TASKS;
            this.transactions = DEFAULT_TRANSACTIONS;
            this.timelogs = DEFAULT_TIMELOGS;
            this.teamMembers = DEFAULT_TEAM_MEMBERS;
        } else {
            this.tasks = localTasks ? JSON.parse(localTasks) : DEFAULT_TASKS;
            this.transactions = localTrans ? JSON.parse(localTrans) : DEFAULT_TRANSACTIONS;
            this.timelogs = localLogs ? JSON.parse(localLogs) : DEFAULT_TIMELOGS;
            this.teamMembers = localTeam ? JSON.parse(localTeam) : DEFAULT_TEAM_MEMBERS;
        }
    }

    // Diğer görsel modülleri başlat
    initModules() {
        this.gantt = new GanttChart("gantt-chart-container");
        this.kanban = new KanbanBoard();
        this.charts = new AnalyticsCharts();
        this.finance = new FinanceManager();
    }

    initGlobalEvents() {
        // SPA Menü Tıklamaları
        const menuItems = document.querySelectorAll(".menu-item");
        menuItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const tabId = item.getAttribute("data-tab");
                window.location.hash = tabId;
            });
        });

        // Hash Değişimini Dinle
        window.addEventListener("hashchange", () => this.handleRouting());

        // Küresel Kullanıcı Filtresi Değiştiğinde (Kişiye Özel Görünüm)
        const userFilter = document.getElementById("global-user-filter");
        if (userFilter) {
            userFilter.addEventListener("change", () => {
                this.saveAndRefresh(); // Grafikleri ve Kanban'ı bu kişiye göre filtrele
            });
        }

        // --- GÖREV EKLEME/DÜZENLEME MODAL İŞLEMLERİ ---
        const btnQuickTask = document.getElementById("btn-quick-task");
        const modalTask = document.getElementById("modal-task");
        const modalTaskClose = document.getElementById("modal-task-close");
        const modalTaskCancel = document.getElementById("modal-task-cancel");
        const formTask = document.getElementById("form-task");

        if (btnQuickTask && modalTask) {
            btnQuickTask.addEventListener("click", () => this.openTaskModal());
        }

        [modalTaskClose, modalTaskCancel].forEach(btn => {
            if (btn && modalTask) {
                btn.addEventListener("click", () => this.closeModal(modalTask));
            }
        });

        if (formTask) {
            formTask.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleTaskFormSubmit();
            });
        }

        // --- FİNANS EKLEME MODAL İŞLEMLERİ ---
        const btnQuickTrans = document.getElementById("btn-quick-transaction");
        const modalTrans = document.getElementById("modal-transaction");
        const modalTransClose = document.getElementById("modal-trans-close");
        const modalTransCancel = document.getElementById("modal-trans-cancel");
        const formModalTrans = document.getElementById("form-modal-transaction");
        const formFinanceTabTrans = document.getElementById("form-add-transaction");

        if (btnQuickTrans && modalTrans) {
            btnQuickTrans.addEventListener("click", () => {
                // Bugünü varsayılan tarih yap
                document.getElementById("m-trans-date").value = new Date().toISOString().split("T")[0];
                this.openModal(modalTrans);
            });
        }

        [modalTransClose, modalTransCancel].forEach(btn => {
            if (btn && modalTrans) {
                btn.addEventListener("click", () => this.closeModal(modalTrans));
            }
        });

        if (formModalTrans) {
            formModalTrans.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleQuickTransactionSubmit();
            });
        }

        if (formFinanceTabTrans) {
            formFinanceTabTrans.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleFinanceTabTransactionSubmit();
            });
        }

        // --- ZAMAN KAYDI FORM İŞLEMLERİ ---
        const formLogTime = document.getElementById("form-log-time");
        if (formLogTime) {
            formLogTime.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleTimeLogSubmit();
            });
        }

        // --- EKİP ÜYESİ EKLEME FORM İŞLEMLERİ ---
        const formAddTeamMember = document.getElementById("form-add-team-member");
        if (formAddTeamMember) {
            formAddTeamMember.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleAddTeamMemberSubmit();
            });
        }
    }

    // SPA Rotalama (Routing)
    handleRouting() {
        const hash = window.location.hash.substring(1) || "dashboard";
        
        // Tüm panelleri gizle, aktif olanı göster
        const panels = document.querySelectorAll(".tab-panel");
        panels.forEach(p => p.classList.remove("active"));
        
        const activePanel = document.getElementById(`panel-${hash}`);
        if (activePanel) {
            activePanel.classList.add("active");
        }

        // Menü aktiflik durumunu güncelle
        const menuItems = document.querySelectorAll(".menu-item");
        menuItems.forEach(item => {
            if (item.getAttribute("data-tab") === hash) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        // Başlıkları güncelle
        const pageTitle = document.getElementById("page-title");
        const pageSubtitle = document.getElementById("page-subtitle");

        const titles = {
            dashboard: { title: "Genel Bakış", sub: "Şirket kurulum süreci ve anlık durum raporu." },
            gantt: { title: "Gantt Çizelgesi", sub: "Tüm süreçlerin takvim ve bağımlılık bazlı zaman akışı." },
            kanban: { title: "Yapılacaklar & Kanban", sub: "Yazılım şirketi kurulum adımlarının Kanban pano ve detaylı yapılacaklar listesi." },
            analytics: { title: "Zaman ve Üretkenlik", sub: "Saatlik, günlük ve haftalık çalışma verimlilik grafikleri." },
            finance: { title: "Bütçe ve Finansal Planlama", sub: "Kuruluş bütçesi, gelir-gider çizelgesi ve runway tahmini." }
        };

        if (pageTitle && pageSubtitle && titles[hash]) {
            pageTitle.textContent = titles[hash].title;
            pageSubtitle.textContent = titles[hash].sub;
        }

        // Sayfa geçişlerinde grafikleri ve Gantt şemasını yeniden çiz (boyutlanma hatalarını gidermek için)
        if (hash === "gantt") this.gantt.render();
        if (hash === "kanban" || hash === "tasks-list") this.kanban.render();
        if (hash === "analytics") this.refreshAnalyticsFormAndCharts();
        if (hash === "finance") this.finance.render();
    }

    // Modal Açma / Kapatma Yardımcıları
    openModal(modalElement) {
        modalElement.style.display = "flex";
        setTimeout(() => modalElement.classList.add("show"), 10);
    }

    closeModal(modalElement) {
        modalElement.classList.remove("show");
        setTimeout(() => modalElement.style.display = "none", 300);
    }

    // Görev Ekleme/Düzenleme Modalı Açılış Hazırlığı
    openTaskModal(taskId = null) {
        const modal = document.getElementById("modal-task");
        const titleElem = document.getElementById("modal-task-title");
        const form = document.getElementById("form-task");

        // Form alanları
        const inputId = document.getElementById("task-id");
        const inputTitle = document.getElementById("task-title");
        const inputDesc = document.getElementById("task-description");
        const selectPhase = document.getElementById("task-phase");
        const selectAssignee = document.getElementById("task-assignee");
        const selectPriority = document.getElementById("task-priority");
        const selectStatus = document.getElementById("task-status");
        const inputStart = document.getElementById("task-start-date");
        const inputEnd = document.getElementById("task-end-date");

        // Aşamaları modal dropdown'ına yükle
        selectPhase.innerHTML = "";
        this.phases.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.name;
            selectPhase.appendChild(opt);
        });

        if (taskId) {
            // DÜZENLEME MODU
            titleElem.textContent = "Görevi Düzenle";
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                inputId.value = task.id;
                inputTitle.value = task.title;
                inputDesc.value = task.description;
                selectPhase.value = task.phaseId;
                selectAssignee.value = task.assignee;
                selectPriority.value = task.priority;
                selectStatus.value = task.status;
                inputStart.value = task.startDate;
                inputEnd.value = task.endDate;
            }
        } else {
            // YENİ GÖREV EKLEME MODU
            titleElem.textContent = "Yeni Görev Ekle";
            form.reset();
            inputId.value = "";
            
            // Varsayılan tarihleri ayarla (Bugün ve 3 gün sonrası)
            const today = new Date().toISOString().split("T")[0];
            const end = new Date();
            end.setDate(end.getDate() + 3);
            const endStr = end.toISOString().split("T")[0];
            
            inputStart.value = today;
            inputEnd.value = endStr;
            selectStatus.value = "To Do";
            selectPriority.value = "Orta";
        }

        this.openModal(modal);
    }

    // Görev Kaydetme
    handleTaskFormSubmit() {
        const id = document.getElementById("task-id").value;
        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-description").value;
        const phaseId = document.getElementById("task-phase").value;
        const assignee = document.getElementById("task-assignee").value;
        const priority = document.getElementById("task-priority").value;
        const status = document.getElementById("task-status").value;
        const startDate = document.getElementById("task-start-date").value;
        const endDate = document.getElementById("task-end-date").value;

        // Tarih Validasyonu
        if (new Date(startDate) > new Date(endDate)) {
            alert("Bitiş tarihi başlangıç tarihinden önce olamaz!");
            return;
        }

        if (id) {
            // Güncelleme
            const index = this.tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                this.tasks[index] = {
                    ...this.tasks[index],
                    title, description, phaseId, assignee, priority, status, startDate, endDate
                };
            }
        } else {
            // Yeni Görev
            const newId = "t_" + Date.now();
            this.tasks.push({
                id: newId,
                title, description, phaseId, assignee, priority, status, startDate, endDate,
                estimatedHours: 10,
                loggedHours: 0
            });
        }

        this.closeModal(document.getElementById("modal-task"));
        this.saveAndRefresh();
    }

    // Görev Silme
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        // Zaman kayıtlarındaki referansları da temizleyebiliriz
        this.timelogs = this.timelogs.filter(log => log.taskId !== taskId);
        this.saveAndRefresh();
    }

    // Kanban Sürükleme Sonucu Durum Güncelleme
    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveAndRefresh();
        }
    }

    // --- FINANSAL İŞLEM EKLEME HESAPLARI ---
    handleQuickTransactionSubmit() {
        const title = document.getElementById("m-trans-title").value;
        const type = document.getElementById("m-trans-type").value;
        const category = document.getElementById("m-trans-category").value;
        const amount = parseFloat(document.getElementById("m-trans-amount").value);
        const date = document.getElementById("m-trans-date").value;

        const newTrans = { id: "tr_" + Date.now(), title, type, category, amount, date };
        this.transactions.push(newTrans);

        this.closeModal(document.getElementById("modal-transaction"));
        document.getElementById("form-modal-transaction").reset();
        this.saveAndRefresh();
    }

    handleFinanceTabTransactionSubmit() {
        const title = document.getElementById("trans-title").value;
        const type = document.getElementById("trans-type").value;
        const category = document.getElementById("trans-category").value;
        const amount = parseFloat(document.getElementById("trans-amount").value);
        const date = document.getElementById("trans-date").value;

        const newTrans = { id: "tr_" + Date.now(), title, type, category, amount, date };
        this.transactions.push(newTrans);

        document.getElementById("form-add-transaction").reset();
        
        // Bugünü varsayılan tarih olarak tut
        document.getElementById("trans-date").value = new Date().toISOString().split("T")[0];
        
        this.saveAndRefresh();
    }

    // İşlem Silme
    deleteTransaction(transId) {
        this.transactions = this.transactions.filter(t => t.id !== transId);
        this.saveAndRefresh();
    }

    // Başlangıç sermayesini güncelle
    updateInitialCapital(newAmount) {
        // Sermaye işlemini bulup güncelle veya yoksa yeni oluştur
        const capTrans = this.transactions.find(t => t.category === "Capital" && t.type === "Income");
        if (capTrans) {
            capTrans.amount = newAmount;
        } else {
            this.transactions.push({
                id: "tr_capital",
                date: "2026-06-01",
                title: "Kurucu Sermaye Aktarımı",
                category: "Capital",
                type: "Income",
                amount: newAmount
            });
        }
        this.saveAndRefresh();
        alert("Sermaye miktarı başarıyla güncellendi.");
    }

    // --- ZAMAN KAYDI İŞLEMLERİ ---
    refreshAnalyticsFormAndCharts() {
        // Görev seçimi dropdown'ını doldur
        const selectTask = document.getElementById("time-task-select");
        if (selectTask) {
            selectTask.innerHTML = "";
            
            // Sadece tamamlanmamış veya aktif görevleri seçelim
            this.tasks.forEach(task => {
                const opt = document.createElement("option");
                opt.value = task.id;
                opt.textContent = `${task.title} (${task.assignee})`;
                selectTask.appendChild(opt);
            });
        }

        // Tarih kısmına bugünü varsayılan ata
        const dateInput = document.getElementById("time-date");
        if (dateInput && !dateInput.value) {
            dateInput.value = "2026-06-11"; // Bugünü simüle eden tarih
        }

        // Grafikleri çiz
        this.charts.renderAll(this.tasks, this.transactions, this.timelogs);
    }

    handleTimeLogSubmit() {
        const taskId = document.getElementById("time-task-select").value;
        const duration = parseFloat(document.getElementById("time-duration").value);
        const date = document.getElementById("time-date").value;

        if (!taskId) {
            alert("Lütfen bir görev seçin!");
            return;
        }

        // Çalışma yoğunluğunu dağıtmak için simüle saat ata
        // Rastgele 9:00 ile 17:00 arası
        const hourOfDay = Math.floor(Math.random() * (17 - 9 + 1)) + 9;

        const newLog = {
            id: "tl_" + Date.now(),
            taskId,
            duration,
            date,
            hourOfDay
        };

        this.timelogs.push(newLog);

        // Görevin içerisindeki çalışma süresini de arttıralım
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.loggedHours = (task.loggedHours || 0) + duration;
        }

        document.getElementById("time-duration").value = "";
        this.saveAndRefresh();
        alert("Çalışma süresi başarıyla kaydedildi.");
    }

    // --- DAHİLİ KAYDETME VE YENİLEME MOTORU ---
    saveAndRefresh() {
        // LocalStorage'a kaydet
        localStorage.setItem("startup_tasks", JSON.stringify(this.tasks));
        localStorage.setItem("startup_transactions", JSON.stringify(this.transactions));
        localStorage.setItem("startup_timelogs", JSON.stringify(this.timelogs));
        localStorage.setItem("startup_team_members", JSON.stringify(this.teamMembers));

        // Dropdown'ları güncelle
        this.populateAssigneeDropdowns();

        // Filtre değerini oku
        const activeAssignee = document.getElementById("global-user-filter").value;

        // Kanban filtrelerini güncelle
        this.kanban.populatePhaseFilter(this.phases);
        this.kanban.render();

        // Gantt Şemasını Yeniden Çiz
        this.gantt.render();

        // Grafikleri Yeniden Çiz
        this.charts.renderAll(this.tasks, this.transactions, this.timelogs);

        // Finans Metriklerini Yeniden Çiz
        this.finance.render();

        // Ekip listesini ve kapasitelerini çiz
        this.renderTeamMembers();

        // Dashboard/Genel Bakış Kartlarını Hesapla
        this.updateDashboardStats(activeAssignee);
    }

    updateDashboardStats(filterUser) {
        // Filtrelenen görevleri bul (Sorumlu filtresi)
        const relevantTasks = filterUser === "all" 
            ? this.tasks 
            : this.tasks.filter(t => t.assignee === filterUser);

        const totalTasks = relevantTasks.length;
        const completedTasks = relevantTasks.filter(t => t.status === "Done").length;
        const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Proje tamamlama barını güncelle
        document.getElementById("project-progress-percentage").textContent = `${progressPct}%`;
        document.getElementById("project-progress-fill").style.width = `${progressPct}%`;

        // İstatistik kart değerleri
        const taskStat = document.getElementById("stat-tasks");
        if (taskStat) taskStat.textContent = `${completedTasks} / ${totalTasks}`;

        // DİNAMİK ZAMAN TAKVİM HESAPLAMALARI
        const today = new Date("2026-06-11"); // Simüle bugünün tarihi
        let minDate = new Date("2026-06-01");
        let maxDate = new Date("2026-08-30");

        if (this.tasks.length > 0) {
            let tempMin = new Date(this.tasks[0].startDate);
            let tempMax = new Date(this.tasks[0].endDate);
            this.tasks.forEach(t => {
                const s = new Date(t.startDate);
                const e = new Date(t.endDate);
                if (s < tempMin) tempMin = s;
                if (e > tempMax) tempMax = e;
            });
            minDate = tempMin;
            maxDate = tempMax;
        }

        const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
        let elapsedDays = Math.ceil((today - minDate) / (1000 * 60 * 60 * 24));
        if (elapsedDays < 0) elapsedDays = 0;
        if (elapsedDays > totalDays) elapsedDays = totalDays;
        let remainingDays = totalDays - elapsedDays;
        if (remainingDays < 0) remainingDays = 0;
        const timeProgressPct = Math.round((elapsedDays / totalDays) * 100);

        // Zaman DOM elemanlarını güncelle
        const timeFill = document.getElementById("project-time-fill");
        const timePct = document.getElementById("project-time-percentage");
        const timeStart = document.getElementById("project-time-start");
        const timeEnd = document.getElementById("project-time-end");
        const timeElapsed = document.getElementById("project-time-elapsed");
        const timeRemaining = document.getElementById("project-time-remaining");

        const formatDateTr = (date) => {
            return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
        };

        if (timeFill) timeFill.style.width = `${timeProgressPct}%`;
        if (timePct) timePct.textContent = `${timeProgressPct}%`;
        if (timeStart) timeStart.textContent = formatDateTr(minDate);
        if (timeEnd) timeEnd.textContent = formatDateTr(maxDate);
        if (timeElapsed) timeElapsed.textContent = `${elapsedDays} Gün`;
        if (timeRemaining) timeRemaining.textContent = `${remainingDays} Gün`;

        // Kalan Proje Süresi İstatistik Kartı
        const dayStat = document.getElementById("stat-days-left");
        if (dayStat) dayStat.textContent = `${remainingDays} Gün Kalan`;
        const dayLabel = document.getElementById("stat-days-label");
        if (dayLabel) dayLabel.textContent = "Kalan Proje Süresi";

        // PROJE SAĞLIK DURUMU & RİSK UYARILARI ANALİZ MOTORU
        const alerts = [];

        // 1. Gecikmiş Görevler (Tarihi geçmiş ve Done olmayanlar)
        const overdueTasks = this.tasks.filter(t => t.status !== "Done" && new Date(t.endDate) < today);
        if (overdueTasks.length > 0) {
            alerts.push({
                type: "danger",
                icon: "fa-solid fa-circle-exclamation",
                message: `<strong>Gecikmiş Görev!</strong> ${overdueTasks.length} adet görev planlanan bitiş tarihini aştı.`
            });
        }

        // 2. Aşırı İş Yükü (Aktif görev sayısı > 3 olanlar)
        this.teamMembers.forEach(member => {
            const activeCount = this.tasks.filter(t => t.assignee === member.name && t.status !== "Done").length;
            if (activeCount > 3) {
                alerts.push({
                    type: "warning",
                    icon: "fa-solid fa-user-ninja",
                    message: `<strong>Aşırı İş Yükü!</strong> ${member.name} üzerinde ${activeCount} aktif görev var.`
                });
            }
        });

        // 3. Finansal Bütçe & Runway Kontrolü
        let totalIncome = 0;
        let totalExpense = 0;
        this.transactions.forEach(t => {
            if (t.type === "Income") totalIncome += t.amount;
            else totalExpense += t.amount;
        });
        const remainingBudget = totalIncome - totalExpense;
        const burnRateDays = Math.max(1, Math.ceil((today - new Date("2026-06-01")) / (1000 * 60 * 60 * 24)));
        const monthlyBurnRate = (totalExpense / burnRateDays) * 30;

        if (monthlyBurnRate > 0) {
            const runwayMonths = remainingBudget / monthlyBurnRate;
            if (runwayMonths < 3) {
                alerts.push({
                    type: "danger",
                    icon: "fa-solid fa-triangle-exclamation",
                    message: `<strong>Kritik Runway!</strong> Finansal dayanım süreniz ${runwayMonths.toFixed(1)} ay. Sermaye girişi gerekli.`
                });
            }
        }

        // Risk uyarılarını DOM'a yerleştir
        const alertsContainer = document.getElementById("project-health-alerts");
        if (alertsContainer) {
            alertsContainer.innerHTML = "";
            if (alerts.length === 0) {
                alertsContainer.innerHTML = `
                    <div class="runway-alert success" style="margin: 0; padding: 8px 12px; font-size: 0.75rem;">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Proje sağlığı mükemmel. Aktif risk veya gecikme bulunmuyor.</span>
                    </div>
                `;
            } else {
                alerts.forEach(alert => {
                    const div = document.createElement("div");
                    div.className = `runway-alert`;
                    div.style.margin = "0";
                    div.style.padding = "8px 12px";
                    div.style.fontSize = "0.75rem";
                    div.style.border = "1px solid";
                    if (alert.type === "warning") {
                        div.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
                        div.style.color = "var(--warning-light)";
                        div.style.borderColor = "rgba(245, 158, 11, 0.15)";
                    } else {
                        div.style.backgroundColor = "rgba(244, 63, 94, 0.1)";
                        div.style.color = "var(--danger-light)";
                        div.style.borderColor = "rgba(244, 63, 94, 0.15)";
                    }
                    div.innerHTML = `
                        <i class="${alert.icon}"></i>
                        <span>${alert.message}</span>
                    `;
                    alertsContainer.appendChild(div);
                });
            }
        }

        // Yaklaşan kritik görevler tablosu (To Do veya In Progress, Yüksek öncelikli görevler)
        const upcomingTableBody = document.querySelector("#table-upcoming-tasks tbody");
        if (upcomingTableBody) {
            upcomingTableBody.innerHTML = "";
            
            const criticalTasks = relevantTasks
                .filter(t => t.status !== "Done")
                .sort((a, b) => {
                    // Yüksek önceliklileri üste al
                    if (a.priority === "Yüksek" && b.priority !== "Yüksek") return -1;
                    if (a.priority !== "Yüksek" && b.priority === "Yüksek") return 1;
                    return new Date(a.endDate) - new Date(b.endDate);
                })
                .slice(0, 5); // ilk 5 kritik görev

            if (criticalTasks.length === 0) {
                upcomingTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;" class="text-muted">Yaklaşan kritik bir görev bulunmuyor.</td></tr>`;
            } else {
                criticalTasks.forEach(task => {
                    const tr = document.createElement("tr");
                    const phase = this.phases.find(p => p.id === task.phaseId);
                    const phaseName = phase ? phase.name : "Planlama";
                    
                    const formattedDate = new Date(task.endDate).toLocaleDateString("tr-TR");
                    const statusText = task.status === "To Do" ? "Bekliyor" : "Yapılıyor";
                    const statusClass = task.status === "To Do" ? "badge-blue" : "badge-warning";

                    tr.innerHTML = `
                        <td style="font-weight:700;">${task.title}</td>
                        <td><span class="badge badge-purple">${phaseName}</span></td>
                        <td style="font-weight:600;">${task.assignee}</td>
                        <td>${formattedDate}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                    `;
                    upcomingTableBody.appendChild(tr);
                });
            }
        }

        // Aşamaların İlerleme Durum Kartları
        const phasesContainer = document.getElementById("phases-progress-container");
        if (phasesContainer) {
            phasesContainer.innerHTML = "";
            
            this.phases.forEach(phase => {
                const phaseTasks = this.tasks.filter(t => t.phaseId === phase.id);
                const total = phaseTasks.length;
                const completed = phaseTasks.filter(t => t.status === "Done").length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                const card = document.createElement("div");
                card.className = "phase-progress-card";
                card.innerHTML = `
                    <div class="phase-info">
                        <span class="phase-title">${phase.name}</span>
                        <span class="phase-pct" style="color:var(--${phase.color}-light);">${pct}%</span>
                    </div>
                    <div class="phase-bar-bg">
                        <div class="phase-bar-fill" style="width:${pct}%; background:var(--${phase.color}-light);"></div>
                    </div>
                `;
                phasesContainer.appendChild(card);
            });
        }
    }

    // --- EKİP ÜYESİ EKLEME VE YÖNETİMİ HESAPLAMALARI ---
    handleAddTeamMemberSubmit() {
        const name = document.getElementById("team-member-name").value.trim();
        const role = document.getElementById("team-member-role").value;
        const cost = parseFloat(document.getElementById("team-member-cost").value);
        const color = document.getElementById("team-member-color").value;

        if (!name) return;

        // İsme göre eşsizlik kontrolü
        if (this.teamMembers.some(m => m.name.toLowerCase() === name.toLowerCase())) {
            alert("Bu isimde bir ekip üyesi zaten mevcut!");
            return;
        }

        const newMember = { name, role, cost, color };
        this.teamMembers.push(newMember);

        // Formu temizle
        document.getElementById("form-add-team-member").reset();
        
        this.saveAndRefresh();
        alert("Yeni ekip üyesi başarıyla eklendi.");
    }

    deleteTeamMember(name) {
        if (name === "Semanur Arslan") {
            alert("Semanur Arslan silinemez!");
            return;
        }
        this.teamMembers = this.teamMembers.filter(m => m.name !== name);
        this.saveAndRefresh();
    }

    populateAssigneeDropdowns() {
        const globalFilter = document.getElementById("global-user-filter");
        const taskAssignee = document.getElementById("task-assignee");

        if (globalFilter && taskAssignee) {
            const currentGlobalVal = globalFilter.value;
            const currentTaskVal = taskAssignee.value;

            // Global Filtreyi Temizle ve Doldur
            globalFilter.innerHTML = '<option value="all">Tüm Ekip</option>';
            this.teamMembers.forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.name;
                opt.textContent = `${m.name} (${m.role})`;
                globalFilter.appendChild(opt);
            });
            
            // Eğer seçilen değer listede hala varsa geri yükle, yoksa 'all' yap
            if (this.teamMembers.some(m => m.name === currentGlobalVal)) {
                globalFilter.value = currentGlobalVal;
            } else {
                globalFilter.value = "all";
            }

            // Görev Seçimini Doldur
            taskAssignee.innerHTML = "";
            this.teamMembers.forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.name;
                opt.textContent = `${m.name} (${m.role})`;
                taskAssignee.appendChild(opt);
            });
            
            if (this.teamMembers.some(m => m.name === currentTaskVal)) {
                taskAssignee.value = currentTaskVal;
            } else {
                taskAssignee.value = this.teamMembers[0].name;
            }
        }
    }

    renderTeamMembers() {
        const tableBody = document.querySelector("#table-team-members tbody");
        const totalCountElem = document.getElementById("team-total-count");

        if (!tableBody) return;

        if (totalCountElem) {
            totalCountElem.textContent = `${this.teamMembers.length} Kişi`;
        }

        tableBody.innerHTML = "";

        this.teamMembers.forEach(member => {
            const tr = document.createElement("tr");

            // Görev istatistiklerini hesapla
            const memberTasks = this.tasks.filter(t => t.assignee === member.name);
            const total = memberTasks.length;
            const completed = memberTasks.filter(t => t.status === "Done").length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            const costStr = new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
                minimumFractionDigits: 0
            }).format(member.cost);

            // Silme butonu (Semanur Arslan silinemez)
            const deleteBtn = member.name === "Semanur Arslan" 
                ? '<span class="text-dark" style="font-size:0.75rem; font-weight:700;">Sistem</span>' 
                : `<button class="btn-delete-trans delete-member-btn" data-name="${member.name}" title="Üyeyi Çıkar"><i class="fa-solid fa-user-minus"></i></button>`;

            tr.innerHTML = `
                <td style="font-weight:700;">
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:var(--${member.color}-light); margin-right:8px;"></span>
                    ${member.name}
                </td>
                <td><span class="badge badge-purple">${member.role}</span></td>
                <td style="font-weight:700;">${costStr} / Saat</td>
                <td style="font-weight:700; text-align:center;">${total}</td>
                <td style="font-weight:700; text-align:center; color:var(--success-light);">${completed}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="phase-bar-bg" style="width:80px; height:6px; background-color:var(--bg-tertiary);">
                            <div class="phase-bar-fill" style="width:${pct}%; background:var(--${member.color}-light);"></div>
                        </div>
                        <span style="font-size:0.75rem; font-weight:800;">%${pct}</span>
                    </div>
                </td>
                <td>${deleteBtn}</td>
            `;

            // Silme olayını bağla
            const btnDel = tr.querySelector(".delete-member-btn");
            if (btnDel) {
                btnDel.addEventListener("click", () => {
                    if (confirm(`"${member.name}" isimli üyeyi ekipten çıkarmak istediğinize emin misiniz?`)) {
                        this.deleteTeamMember(member.name);
                    }
                });
            }

            tableBody.appendChild(tr);
        });
    }

    // --- STOPWATCH KRONOMETRE METODLARI ---
    initStopwatch() {
        this.stopwatchSeconds = 0;
        this.stopwatchRunning = false;
        this.stopwatchInterval = null;

        const btnToggle = document.getElementById("btn-stopwatch-toggle");
        const btnReset = document.getElementById("btn-stopwatch-reset");
        const btnLog = document.getElementById("btn-stopwatch-log");
        const status = document.getElementById("stopwatch-status");

        if (!btnToggle || !btnReset || !btnLog) return;

        btnToggle.addEventListener("click", () => {
            if (this.stopwatchRunning) {
                // Pause
                this.stopwatchRunning = false;
                clearInterval(this.stopwatchInterval);
                btnToggle.innerHTML = '<i class="fa-solid fa-play"></i> Başlat';
                status.textContent = "Duraklatıldı";
                status.className = "badge badge-warning";
                btnLog.disabled = this.stopwatchSeconds === 0;
            } else {
                // Play
                this.stopwatchRunning = true;
                btnToggle.innerHTML = '<i class="fa-solid fa-pause"></i> Duraklat';
                status.textContent = "Çalışıyor";
                status.className = "badge badge-green";
                btnLog.disabled = true;
                this.stopwatchInterval = setInterval(() => {
                    this.stopwatchSeconds++;
                    this.updateStopwatchDisplay();
                }, 1000);
            }
        });

        btnReset.addEventListener("click", () => {
            this.stopwatchRunning = false;
            clearInterval(this.stopwatchInterval);
            this.stopwatchSeconds = 0;
            this.updateStopwatchDisplay();
            btnToggle.innerHTML = '<i class="fa-solid fa-play"></i> Başlat';
            status.textContent = "Duraklatıldı";
            status.className = "badge badge-warning";
            btnLog.disabled = true;
        });

        btnLog.addEventListener("click", () => {
            if (this.stopwatchSeconds === 0) return;
            
            // Saniyeyi saate dönüştür (en yakın 0.5 saat, minimum 0.5 saat)
            const hours = Math.max(0.5, Math.round((this.stopwatchSeconds / 3600) * 2) / 2);
            
            // Zaman sayfasına geç
            window.location.hash = "analytics";
            
            // Süre alanına ata
            const durationInput = document.getElementById("time-duration");
            if (durationInput) {
                durationInput.value = hours;
            }
            
            // Kronometreyi sıfırla
            this.stopwatchRunning = false;
            clearInterval(this.stopwatchInterval);
            this.stopwatchSeconds = 0;
            this.updateStopwatchDisplay();
            btnToggle.innerHTML = '<i class="fa-solid fa-play"></i> Başlat';
            status.textContent = "Duraklatıldı";
            status.className = "badge badge-warning";
            btnLog.disabled = true;

            alert(`Kronometre süresi (${hours} saat) çalışma kaydı formuna aktarıldı. Kaydet butonuna basarak kaydedebilirsiniz.`);
        });
    }

    updateStopwatchDisplay() {
        const display = document.getElementById("stopwatch-display");
        if (!display) return;

        const hrs = Math.floor(this.stopwatchSeconds / 3600);
        const mins = Math.floor((this.stopwatchSeconds % 3600) / 60);
        const secs = this.stopwatchSeconds % 60;

        const format = (val) => String(val).padStart(2, "0");
        display.textContent = `${format(hrs)}:${format(mins)}:${format(secs)}`;
    }
}

// Uygulama yükleme tetikleyicisi
document.addEventListener("DOMContentLoaded", () => {
    // Giriş alanları için varsayılan bugünün tarihini tanımla
    const transDateInput = document.getElementById("trans-date");
    if (transDateInput) {
        transDateInput.value = new Date().toISOString().split("T")[0];
    }

    // Uygulamayı başlat
    window.App = new StartupApp();
});
