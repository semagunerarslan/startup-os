/* 
   StartUp OS - LaunchFlow Bütçe & Finans Kontrol Paneli
   Gelir/Gider Tablosu Yönetimi, Nakit Akışı, Aylık Gider Hızı (Burn Rate) ve Runway Hesaplama
*/

class FinanceManager {
    constructor() {
        this.tableBody = document.querySelector("#table-transactions tbody");
        this.totalIncomeElem = document.getElementById("finance-total-income");
        this.totalExpenseElem = document.getElementById("finance-total-expense");
        this.burnRateElem = document.getElementById("finance-burn-rate");
        
        this.runwayWarningBox = document.getElementById("runway-warning-box");
        this.runwayMessage = document.getElementById("runway-message");

        this.transFilter = "all"; // "all", "Income", "Expense"

        this.categoryLabels = {
            Legal: "Resmi İşlemler",
            Office: "Ofis & Kira",
            Hardware: "Donanım",
            Software: "Yazılım Lisansları",
            Marketing: "Pazarlama & Reklam",
            HR: "İK & İşe Alım",
            Capital: "Sermaye",
            Other: "Diğer"
        };

        this.initEventListeners();
    }

    initEventListeners() {
        // Tablo Filtre Butonları
        const btnAll = document.getElementById("filter-trans-all");
        const btnInc = document.getElementById("filter-trans-income");
        const btnExp = document.getElementById("filter-trans-expense");

        if (btnAll && btnInc && btnExp) {
            btnAll.addEventListener("click", () => {
                this.transFilter = "all";
                this.setActiveFilterButton(btnAll);
                this.render();
            });
            btnInc.addEventListener("click", () => {
                this.transFilter = "Income";
                this.setActiveFilterButton(btnInc);
                this.render();
            });
            btnExp.addEventListener("click", () => {
                this.transFilter = "Expense";
                this.setActiveFilterButton(btnExp);
                this.render();
            });
        }

        // Sermaye Güncelleme Butonu
        const btnUpdateCapital = document.getElementById("btn-update-capital");
        const inputCapital = document.getElementById("input-startup-capital");
        
        if (btnUpdateCapital && inputCapital) {
            btnUpdateCapital.addEventListener("click", () => {
                const amount = parseFloat(inputCapital.value);
                if (amount && amount > 0) {
                    if (window.App) {
                        window.App.updateInitialCapital(amount);
                    }
                }
            });
        }

        // CSV Dışa Aktar Butonu
        const btnExportFinance = document.getElementById("btn-export-finance-csv");
        if (btnExportFinance) {
            btnExportFinance.addEventListener("click", () => this.exportTransactionsToCSV());
        }
    }

    setActiveFilterButton(activeBtn) {
        ["filter-trans-all", "filter-trans-income", "filter-trans-expense"].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.remove("active");
        });
        activeBtn.classList.add("active");
    }

    // Finansal Raporları ve Runway Değerini Hesaplar
    calculateMetrics() {
        const transactions = window.App ? window.App.transactions : [];
        
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === "Income") {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        const remainingBudget = totalIncome - totalExpense;

        // Burn Rate (Aylık Ortalama Harcama Hızı)
        // 01 Haziran 2026'dan 11 Haziran 2026'ya kadar 11 gün geçtiğini varsayıyoruz.
        // Hızı daha mantıklı yansıtmak için minimum 1 ay baz alalım veya gün bazlı aylık projeksiyon yapalım.
        const startDate = new Date("2026-06-01");
        const todayDate = new Date("2026-06-11"); // Bugünü simüle eden tarih
        const daysElapsed = Math.max(1, Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24)));
        
        // 30 günlük aylık ortalama harcama projeksiyonu
        const monthlyBurnRate = (totalExpense / daysElapsed) * 30;

        // Elementleri Güncelle
        if (this.totalIncomeElem) this.totalIncomeElem.textContent = this.formatCurrency(totalIncome);
        if (this.totalExpenseElem) this.totalExpenseElem.textContent = this.formatCurrency(totalExpense);
        if (this.burnRateElem) this.burnRateElem.textContent = this.formatCurrency(monthlyBurnRate) + " / Ay";

        // Dashboard Kalan Bütçe ve Runway Bilgisini Güncelle
        const statBudget = document.getElementById("stat-budget");
        if (statBudget) statBudget.textContent = this.formatCurrency(remainingBudget);

        const statRunway = document.getElementById("stat-runway");
        this.updateRunwayAlerts(remainingBudget, monthlyBurnRate, statRunway);
    }

    // Runway (Finansal Dayanım Süresi) Uyarı Kutusu Güncellemesi
    updateRunwayAlerts(remainingBudget, burnRate, dashboardStatElem) {
        if (burnRate <= 0) {
            if (dashboardStatElem) dashboardStatElem.textContent = "Sınırsız";
            this.setRunwayBox("success", "Harcama yapılmadığı için mevcut bütçe dayanım süresi sınırsızdır.");
            return;
        }

        const runwayMonths = remainingBudget / burnRate;
        const runwayText = runwayMonths >= 12 
            ? Math.round(runwayMonths / 12) + " Yıl+" 
            : runwayMonths.toFixed(1) + " Ay";

        if (dashboardStatElem) {
            dashboardStatElem.textContent = runwayText;
        }

        if (runwayMonths > 6) {
            this.setRunwayBox("success", `Finansal durumunuz gayet sağlıklı. Mevcut harcama hızıyla bütçeniz <strong>${runwayText}</strong> yetecektir.`);
        } else if (runwayMonths >= 3) {
            this.setRunwayBox("success", `Nakit akışınız dengeli. Mevcut bütçeniz tahmini <strong>${runwayText}</strong> dayanacaktır. Harcamaları izlemeye devam edin.`, true);
        } else {
            this.setRunwayBox("warning", `<strong>Kritik Seviye!</strong> Mevcut bütçeniz <strong>${runwayText}</strong> içinde tükenebilir! Lütfen yeni sermaye ekleyin veya giderlerinizi kısın.`);
        }
    }

    setRunwayBox(type, message, isOrange = false) {
        if (!this.runwayWarningBox || !this.runwayMessage) return;

        this.runwayWarningBox.className = `runway-alert ${type}`;
        this.runwayMessage.innerHTML = message;

        // Turuncu uyarı durumunda warning sınıfı ama farklı renk kodlaması yapılabilir
        if (isOrange) {
            this.runwayWarningBox.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
            this.runwayWarningBox.style.color = "var(--warning-light)";
            this.runwayWarningBox.style.borderColor = "rgba(245, 158, 11, 0.15)";
        } else {
            this.runwayWarningBox.style.backgroundColor = "";
            this.runwayWarningBox.style.color = "";
            this.runwayWarningBox.style.borderColor = "";
        }
    }

    render() {
        if (!this.tableBody) return;

        // Önce metrikleri hesapla
        this.calculateMetrics();

        this.tableBody.innerHTML = "";
        const transactions = window.App ? window.App.transactions : [];

        // Filtrele ve tarihe göre tersten sırala (en yeni en üstte)
        const filtered = transactions.filter(t => {
            if (this.transFilter === "all") return true;
            return t.type === this.transFilter;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filtered.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;" class="text-muted">Herhangi bir finansal işlem bulunamadı.</td></tr>`;
            return;
        }

        filtered.forEach(trans => {
            const tr = document.createElement("tr");

            const dateStr = new Date(trans.date).toLocaleDateString("tr-TR");
            const typeLabel = trans.type === "Income" ? "Gelir" : "Gider";
            const typeBadgeClass = trans.type === "Income" ? "badge-green" : "badge-rose";
            const amountColorClass = trans.type === "Income" ? "text-green" : "text-rose";
            const prefix = trans.type === "Income" ? "+" : "-";

            tr.innerHTML = `
                <td>${dateStr}</td>
                <td style="font-weight:700;">${trans.title}</td>
                <td><span class="badge badge-purple">${this.categoryLabels[trans.category] || trans.category}</span></td>
                <td><span class="badge ${typeBadgeClass}">${typeLabel}</span></td>
                <td class="${amountColorClass}" style="font-weight:800;">${prefix} ${this.formatCurrency(trans.amount)}</td>
                <td>
                    <button class="btn-delete-trans delete-trans-btn" data-id="${trans.id}" title="İşlemi Sil">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;

            // Silme butonuna olay dinleyici ekle
            tr.querySelector(".delete-trans-btn").addEventListener("click", (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm(`"${trans.title}" işlemini silmek istediğinize emin misiniz?`)) {
                    if (window.App) {
                        window.App.deleteTransaction(id);
                    }
                }
            });

            this.tableBody.appendChild(tr);
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // --- CSV DIŞA AKTARMA ---
    exportTransactionsToCSV() {
        const transactions = window.App ? window.App.transactions : [];
        if (transactions.length === 0) {
            alert("Aktarılacak işlem bulunmuyor.");
            return;
        }

        // Tarihe göre sırala
        const sortedTrans = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

        let csvContent = "Tarih,Açıklama,Kategori,Tür,Tutar\n";

        sortedTrans.forEach(t => {
            const dateStr = new Date(t.date).toLocaleDateString("tr-TR");
            const typeLabel = t.type === "Income" ? "Gelir" : "Gider";
            const categoryLabel = this.categoryLabels[t.category] || t.category;
            
            const clean = (val) => {
                if (val === undefined || val === null) return "";
                const str = String(val).replace(/"/g, '""');
                return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
            };

            csvContent += `${clean(dateStr)},${clean(t.title)},${clean(categoryLabel)},${clean(typeLabel)},${t.amount}\n`;
        });

        // UTF-8 BOM ile Türkçe karakter desteği
        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `startup_os_gelir_gider_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
