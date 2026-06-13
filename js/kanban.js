/* 
   StartUp OS - LaunchFlow Kanban & İş Planı Listeleme Motoru
   Kart Görünümü (Kanban Pano) ve Detaylı Tablo Görünümü (İş Listesi)
   Gerçek Sorumluları ve İş Atamalarını Ayrıntılı Gösterme Desteği
*/

class KanbanBoard {
    constructor() {
        this.todoContainer = document.getElementById("cards-todo");
        this.progressContainer = document.getElementById("cards-progress");
        this.doneContainer = document.getElementById("cards-done");

        this.boardViewContainer = document.getElementById("kanban-board-view");
        this.tableViewContainer = document.getElementById("kanban-table-view");
        this.tableBody = document.querySelector("#table-tasks-list tbody");

        // Kanban Board Filtreleri
        this.searchInput = document.getElementById("kanban-search");
        this.priorityFilter = document.getElementById("kanban-priority-filter");
        this.phaseFilter = document.getElementById("kanban-phase-filter");

        // Yapılacaklar Listesi Filtreleri (Yeni Panel)
        this.tasksSearchInput = document.getElementById("tasks-search");
        this.tasksPriorityFilter = document.getElementById("tasks-priority-filter");
        this.tasksPhaseFilter = document.getElementById("tasks-phase-filter");

        this.sortKey = null;
        this.sortDirection = "asc";

        this.initEventListeners();
    }

    initEventListeners() {
        // Kanban Arama ve Filtrelerin Dinamik İzlenmesi
        const kanbanTriggers = [this.searchInput, this.priorityFilter, this.phaseFilter];
        kanbanTriggers.forEach(elem => {
            if (elem) {
                elem.addEventListener("input", () => this.render());
                elem.addEventListener("change", () => this.render());
            }
        });

        // Yapılacaklar Listesi Arama ve Filtrelerin Dinamik İzlenmesi
        const listTriggers = [this.tasksSearchInput, this.tasksPriorityFilter, this.tasksPhaseFilter];
        listTriggers.forEach(elem => {
            if (elem) {
                elem.addEventListener("input", () => this.render());
                elem.addEventListener("change", () => this.render());
            }
        });

        // Tablo Sütun Başlığı Sıralama Dinleyicileri
        const headers = document.querySelectorAll("#table-tasks-list th");
        const sortKeys = ["title", "phaseId", "assignee", "endDate", "priority", "status"];
        headers.forEach((th, idx) => {
            if (idx < sortKeys.length) {
                th.style.cursor = "pointer";
                th.style.userSelect = "none";
                th.addEventListener("click", () => {
                    const key = sortKeys[idx];
                    if (this.sortKey === key) {
                        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
                    } else {
                        this.sortKey = key;
                        this.sortDirection = "asc";
                    }
                    this.render();
                });
            }
        });

        // CSV Dışa Aktar Buton Dinleyicisi
        const btnExportTasks = document.getElementById("btn-export-tasks-csv");
        if (btnExportTasks) {
            btnExportTasks.addEventListener("click", () => this.exportTasksToCSV());
        }

        // Sürükle-Bırak Sütun Hedeflerini Yapılandır (Kanban Görünümü için)
        const columns = document.querySelectorAll(".kanban-column");
        columns.forEach(col => {
            col.addEventListener("dragover", (e) => this.onDragOver(e, col));
            col.addEventListener("dragenter", (e) => this.onDragEnter(e, col));
            col.addEventListener("dragleave", (e) => this.onDragLeave(e, col));
            col.addEventListener("drop", (e) => this.onDrop(e, col));
        });
    }

    // Aşamaları filtre dropdown'ına doldurur
    populatePhaseFilter(phases) {
        // 1. Kanban Filtresi Doldur
        if (this.phaseFilter) {
            const currentVal = this.phaseFilter.value;
            this.phaseFilter.innerHTML = '<option value="all">Tüm Aşamalar</option>';
            phases.forEach(phase => {
                const opt = document.createElement("option");
                opt.value = phase.id;
                opt.textContent = phase.name;
                this.phaseFilter.appendChild(opt);
            });
            this.phaseFilter.value = currentVal;
        }

        // 2. Yapılacaklar Listesi Filtresi Doldur
        if (this.tasksPhaseFilter) {
            const currentTasksVal = this.tasksPhaseFilter.value;
            this.tasksPhaseFilter.innerHTML = '<option value="all">Tüm Aşamalar</option>';
            phases.forEach(phase => {
                const opt = document.createElement("option");
                opt.value = phase.id;
                opt.textContent = phase.name;
                this.tasksPhaseFilter.appendChild(opt);
            });
            this.tasksPhaseFilter.value = currentTasksVal;
        }
    }

    // Kanban Pano Görevlerini Filtreler
    getFilteredTasksForBoard() {
        const tasks = window.App ? window.App.tasks : [];
        const globalUser = document.getElementById("global-user-filter").value;
        const searchQuery = this.searchInput ? this.searchInput.value.toLowerCase().trim() : "";
        const selectedPriority = this.priorityFilter ? this.priorityFilter.value : "all";
        const selectedPhase = this.phaseFilter ? this.phaseFilter.value : "all";

        return tasks.filter(task => {
            if (globalUser !== "all" && task.assignee !== globalUser) return false;
            if (searchQuery !== "" && !task.title.toLowerCase().includes(searchQuery) && !task.description.toLowerCase().includes(searchQuery)) return false;
            if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
            if (selectedPhase !== "all" && task.phaseId !== selectedPhase) return false;
            return true;
        });
    }

    // Yapılacaklar Listesi Görevlerini Filtreler
    getFilteredTasksForTable() {
        const tasks = window.App ? window.App.tasks : [];
        const globalUser = document.getElementById("global-user-filter").value;
        const searchQuery = this.tasksSearchInput ? this.tasksSearchInput.value.toLowerCase().trim() : "";
        const selectedPriority = this.tasksPriorityFilter ? this.tasksPriorityFilter.value : "all";
        const selectedPhase = this.tasksPhaseFilter ? this.tasksPhaseFilter.value : "all";

        return tasks.filter(task => {
            if (globalUser !== "all" && task.assignee !== globalUser) return false;
            if (searchQuery !== "" && !task.title.toLowerCase().includes(searchQuery) && !task.description.toLowerCase().includes(searchQuery)) return false;
            if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
            if (selectedPhase !== "all" && task.phaseId !== selectedPhase) return false;
            return true;
        });
    }

    render() {
        this.renderBoardView(this.getFilteredTasksForBoard());
        this.renderTableView(this.getFilteredTasksForTable());
    }

    // A. KANBAN KART GÖRÜNÜMÜ ÇİZİMİ
    renderBoardView(filteredTasks) {
        if (!this.todoContainer || !this.progressContainer || !this.doneContainer) return;

        this.todoContainer.innerHTML = "";
        this.progressContainer.innerHTML = "";
        this.doneContainer.innerHTML = "";

        const phases = window.App ? window.App.phases : [];

        let countTodo = 0;
        let countProgress = 0;
        let countDone = 0;

        filteredTasks.forEach(task => {
            const phase = phases.find(p => p.id === task.phaseId);
            const phaseName = phase ? phase.name : "Planlama";

            const card = this.createCardElement(task, phaseName);

            if (task.status === "To Do") {
                this.todoContainer.appendChild(card);
                countTodo++;
            } else if (task.status === "In Progress") {
                this.progressContainer.appendChild(card);
                countProgress++;
            } else if (task.status === "Done") {
                this.doneContainer.appendChild(card);
                countDone++;
            }
        });

        document.getElementById("count-todo").textContent = countTodo;
        document.getElementById("count-progress").textContent = countProgress;
        document.getElementById("count-done").textContent = countDone;
    }

    createCardElement(task, phaseName) {
        const card = document.createElement("div");
        card.className = `kanban-card priority-${task.priority}`;
        card.setAttribute("draggable", "true");
        card.setAttribute("data-id", task.id);

        const formattedDate = new Date(task.endDate).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short"
        });

        let priorityClass = "badge-blue";
        if (task.priority === "Yüksek") priorityClass = "badge-rose";
        else if (task.priority === "Orta") priorityClass = "badge-warning";

        card.innerHTML = `
            <div class="card-priority-header">
                <span class="badge ${priorityClass}">${task.priority} Öncelik</span>
                <span class="card-phase-tag">${phaseName}</span>
            </div>
            <div class="card-title">${task.title}</div>
            <div class="card-desc">${task.description || "Açıklama girilmemiş."}</div>
            <div class="card-meta">
                <span class="card-date"><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>
                <span class="card-assignee">${task.assignee}</span>
            </div>
            <div style="display:flex; justify-content: flex-end; gap:10px; margin-top:10px; border-top: 1px solid rgba(255,255,255,0.03); padding-top:10px;">
                <button class="btn-delete-trans edit-task-btn" title="Görevi Düzenle"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-delete-trans delete-task-btn" title="Görevi Sil" style="color:var(--text-dark);"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        card.addEventListener("dragstart", (e) => this.onDragStart(e, card));
        card.addEventListener("dragend", () => this.onDragEnd(card));

        card.querySelector(".edit-task-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            if (window.App && typeof window.App.openTaskModal === "function") {
                window.App.openTaskModal(task.id);
            }
        });

        card.querySelector(".delete-task-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm(`"${task.title}" görevini silmek istediğinize emin misiniz?`)) {
                if (window.App && typeof window.App.deleteTask === "function") {
                    window.App.deleteTask(task.id);
                }
            }
        });

        return card;
    }

    // B. TABLO GÖRÜNÜMÜ ÇİZİMİ
    renderTableView(filteredTasks) {
        if (!this.tableBody) return;

        // Tablo Başlıklarını Güncelle (Sıralama Oklarını Ekle)
        const headers = document.querySelectorAll("#table-tasks-list th");
        const sortKeys = ["title", "phaseId", "assignee", "endDate", "priority", "status"];
        const headerTexts = ["Görev Adı", "Aşama", "Sorumlu Kişi", "Zaman Aralığı", "Öncelik", "Durum", "İşlem"];
        
        headers.forEach((th, idx) => {
            if (idx < sortKeys.length) {
                let text = headerTexts[idx];
                if (this.sortKey === sortKeys[idx]) {
                    text += this.sortDirection === "asc" ? " ▲" : " ▼";
                    th.style.color = "var(--primary-light)";
                } else {
                    th.style.color = "";
                }
                th.textContent = text;
            }
        });

        // Görevleri Sırala
        if (this.sortKey) {
            filteredTasks.sort((a, b) => {
                let valA = a[this.sortKey] || "";
                let valB = b[this.sortKey] || "";
                
                if (this.sortKey === "priority") {
                    const weight = { "Yüksek": 3, "Orta": 2, "Düşük": 1 };
                    valA = weight[valA] || 0;
                    valB = weight[valB] || 0;
                }
                
                if (this.sortKey === "status") {
                    const weight = { "To Do": 1, "In Progress": 2, "Done": 3 };
                    valA = weight[valA] || 0;
                    valB = weight[valB] || 0;
                }

                if (typeof valA === "string") {
                    return this.sortDirection === "asc" 
                        ? valA.localeCompare(valB, "tr") 
                        : valB.localeCompare(valA, "tr");
                } else {
                    return this.sortDirection === "asc" 
                        ? valA - valB 
                        : valB - valA;
                }
            });
        }

        this.tableBody.innerHTML = "";
        const phases = window.App ? window.App.phases : [];
        const teamMembers = window.App ? window.App.teamMembers : [];

        if (filteredTasks.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;" class="text-muted">Arama kriterlerine uygun görev bulunamadı.</td></tr>`;
            return;
        }

        filteredTasks.forEach(task => {
            const tr = document.createElement("tr");

            const phase = phases.find(p => p.id === task.phaseId);
            const phaseName = phase ? phase.name : "Planlama";

            const member = teamMembers.find(m => m.name === task.assignee);
            const memberColor = member ? member.color : "purple";

            // Tarih Aralığı
            const startStr = new Date(task.startDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
            const endStr = new Date(task.endDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

            // Öncelik
            let priorityBadge = '<span class="badge badge-blue">Düşük</span>';
            if (task.priority === "Yüksek") priorityBadge = '<span class="badge badge-rose">Yüksek</span>';
            else if (task.priority === "Orta") priorityBadge = '<span class="badge badge-warning">Orta</span>';

            // Durum
            let statusBadge = '<span class="badge badge-blue">Bekliyor</span>';
            if (task.status === "In Progress") statusBadge = '<span class="badge badge-warning">Yapılıyor</span>';
            else if (task.status === "Done") statusBadge = '<span class="badge badge-green">Tamamlandı</span>';

            const isDone = task.status === "Done";
            const checkedAttr = isDone ? "checked" : "";
            const textDecoration = isDone ? "text-decoration: line-through; opacity: 0.6;" : "";

            tr.innerHTML = `
                <td style="font-weight:700;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${checkedAttr} style="width: 17px; height: 17px; accent-color: var(--success-light); cursor: pointer;">
                        <span style="${textDecoration}">${task.title}</span>
                    </div>
                </td>
                <td><span class="badge badge-purple">${phaseName}</span></td>
                <td style="font-weight:700;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:var(--${memberColor}-light); margin-right:8px;"></span>
                    ${task.assignee}
                </td>
                <td>${startStr} - ${endStr}</td>
                <td>${priorityBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display:flex; gap:12px;">
                        <button class="btn-delete-trans t-edit-btn" data-id="${task.id}" title="Düzenle" style="color:var(--text-muted);"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-delete-trans t-del-btn" data-id="${task.id}" title="Sil" style="color:var(--text-dark);"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;

            tr.querySelector(".task-checkbox").addEventListener("change", (e) => {
                const newStatus = e.target.checked ? "Done" : "To Do";
                if (window.App) {
                    window.App.updateTaskStatus(task.id, newStatus);
                }
            });

            tr.querySelector(".t-edit-btn").addEventListener("click", () => {
                if (window.App && typeof window.App.openTaskModal === "function") {
                    window.App.openTaskModal(task.id);
                }
            });

            tr.querySelector(".t-del-btn").addEventListener("click", () => {
                if (confirm(`"${task.title}" görevini silmek istediğinize emin misiniz?`)) {
                    if (window.App && typeof window.App.deleteTask === "function") {
                        window.App.deleteTask(task.id);
                    }
                }
            });

            this.tableBody.appendChild(tr);
        });
    }

    // HTML5 Drag and Drop İşleyicileri
    onDragStart(e, card) {
        card.classList.add("dragging");
        e.dataTransfer.setData("text/plain", card.getAttribute("data-id"));
        e.dataTransfer.effectAllowed = "move";
    }

    onDragEnd(card) {
        card.classList.remove("dragging");
        document.querySelectorAll(".kanban-column").forEach(col => {
            col.classList.remove("dropzone-active");
        });
    }

    onDragOver(e, col) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

    onDragEnter(e, col) {
        e.preventDefault();
        col.classList.add("dropzone-active");
    }

    onDragLeave(e, col) {
        col.classList.remove("dropzone-active");
    }

    onDrop(e, col) {
        e.preventDefault();
        col.classList.remove("dropzone-active");

        const taskId = e.dataTransfer.getData("text/plain");
        const newStatus = col.getAttribute("data-status");

        if (taskId && newStatus && window.App) {
            window.App.updateTaskStatus(taskId, newStatus);
        }
    }

    // --- CSV DIŞA AKTARMA ---
    exportTasksToCSV() {
        const tasks = this.getFilteredTasksForTable();
        if (tasks.length === 0) {
            alert("Aktarılacak görev bulunmuyor.");
            return;
        }

        const phases = window.App ? window.App.phases : [];

        let csvContent = "Görev Adı,Aşama,Sorumlu,Başlangıç Tarihi,Bitiş Tarihi,Öncelik,Durum,Tahmini Süre (Saat),Harcanan Süre (Saat)\n";

        tasks.forEach(task => {
            const phase = phases.find(p => p.id === task.phaseId);
            const phaseName = phase ? phase.name : "Planlama";
            
            const clean = (val) => {
                if (val === undefined || val === null) return "";
                const str = String(val).replace(/"/g, '""');
                return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
            };

            csvContent += `${clean(task.title)},${clean(phaseName)},${clean(task.assignee)},${clean(task.startDate)},${clean(task.endDate)},${clean(task.priority)},${clean(task.status)},${task.estimatedHours || 0},${task.loggedHours || 0}\n`;
        });

        // UTF-8 BOM ile Türkçe karakter desteği
        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `startup_os_is_plani_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
