/* 
   StartUp OS - LaunchFlow Varsayılan Başlangıç Verileri
   Yönetici Semanur Arslan ve Gerçek İsimlerle Optimize Edilmiş Ekip Kadrosu
   Grafikleri Doldurmak İçin Kapsamlı ve Yoğun Çalışma Zaman Kayıtları (TimeLogs)
*/

const DEFAULT_PHASES = [
    { id: "p1", name: "İş Modeli ve Planlama", color: "purple" },
    { id: "p2", name: "Yasal Kurulum & Şirket Açılışı", color: "blue" },
    { id: "p3", name: "Finansal Kurulum & Muhasebe", color: "blue" },
    { id: "p4", name: "Ofis, Donanım & BT Altyapısı", color: "green" },
    { id: "p5", name: "Markalama, Kurumsal Kimlik & Web", color: "rose" },
    { id: "p6", name: "İK & Ekip Kurulumu", color: "purple" },
    { id: "p7", name: "Pazarlama & Müşteri Bulma", color: "rose" },
    { id: "p8", name: "Resmi Açılış & İlk Proje", color: "green" }
];

const DEFAULT_TEAM_MEMBERS = [
    { name: "Semanur Arslan", role: "Yönetici / CEO", cost: 450, color: "purple" },
    { name: "Ahmet Çelik", role: "Mali Müşavir", cost: 200, color: "blue" },
    { name: "Av. Meltem Aksoy", role: "Hukuk Danışmanı", cost: 350, color: "rose" },
    { name: "Zeynep Yalçın", role: "UI/UX Tasarımcı", cost: 180, color: "warning" },
    { name: "Mert Yılmaz", role: "Tech Lead", cost: 300, color: "green" },
    { name: "Selin Kaya", role: "Full-Stack Geliştirici", cost: 240, color: "blue" }
];

const DEFAULT_TASKS = [
    // Aşama 1: İş Modeli ve Planlama (01 Haziran - 07 Haziran)
    {
        id: "t1_1",
        title: "Pazar Analizi ve Rakip Araştırması",
        description: "Türkiye ve yurt dışındaki SaaS / Yazılım Ajansı modellerinin, fiyatlandırma stratejilerinin analiz edilmesi.",
        phaseId: "p1",
        assignee: "Semanur Arslan",
        priority: "Yüksek",
        status: "Done",
        startDate: "2026-06-01",
        endDate: "2026-06-04",
        estimatedHours: 20,
        onCriticalPath: true
    },
    {
        id: "t1_2",
        title: "Finansal Yol Haritası & Projeksiyonlar",
        description: "Gider tahminleri, gelir hedefleri ve 1 yıllık nakit akış tablosunun hazırlanması.",
        phaseId: "p1",
        assignee: "Semanur Arslan",
        priority: "Yüksek",
        status: "Done",
        startDate: "2026-06-04",
        endDate: "2026-06-07",
        estimatedHours: 24,
        onCriticalPath: true
    },
    {
        id: "t1_3",
        title: "KOSGEB Girişimcilik Desteği Başvurusu",
        description: "Girişimcilik destek programı başvuru dosyasının hazırlanması ve sisteme yüklenmesi.",
        phaseId: "p1",
        assignee: "Semanur Arslan",
        priority: "Orta",
        status: "Done",
        startDate: "2026-06-05",
        endDate: "2026-06-07",
        estimatedHours: 12,
        onCriticalPath: false
    },
    // Aşama 2: Yasal Kurulum & Şirket Açılışı (08 Haziran - 17 Haziran)
    {
        id: "t2_1",
        title: "Hissedarlar/Ortaklık Sözleşmesi Taslağı",
        description: "Kurucular arası hisse oranları, yönetim yetkileri ve ayrılma maddelerini içeren ana sözleşmenin yazılması.",
        phaseId: "p2",
        assignee: "Av. Meltem Aksoy",
        priority: "Yüksek",
        status: "In Progress",
        startDate: "2026-06-08",
        endDate: "2026-06-12",
        estimatedHours: 15,
        onCriticalPath: true
    },
    {
        id: "t2_2",
        title: "Noter Vekaleti ve Kuruluş Evrakları",
        description: "Kurulum dosyasının hazırlanması için mali müşavire imza sirküleri ve noter vekaleti verilmesi.",
        phaseId: "p2",
        assignee: "Semanur Arslan",
        priority: "Yüksek",
        status: "Done",
        startDate: "2026-06-09",
        endDate: "2026-06-11",
        estimatedHours: 8,
        onCriticalPath: true
    },
    {
        id: "t2_3",
        title: "Vergi Dairesi Başvurusu ve Yoklama Süreci",
        description: "Maliye Bakanlığı interaktif vergi dairesi üzerinden açılış bildirimi yapılması ve yoklama memurlarının karşılanması.",
        phaseId: "p2",
        assignee: "Ahmet Çelik",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-06-11",
        endDate: "2026-06-13",
        estimatedHours: 10,
        onCriticalPath: true
    },
    {
        id: "t2_4",
        title: "Ticaret Odası (ITO) Kaydı ve İlanı",
        description: "İlgili Ticaret Odasına başvuru yapılması ve tescil işlemlerinin tamamlanarak Resmi Sicil Gazetesi ilanı.",
        phaseId: "p2",
        assignee: "Ahmet Çelik",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-06-14",
        endDate: "2026-06-17",
        estimatedHours: 18,
        onCriticalPath: true
    },
    // Aşama 3: Finansal Kurulum & Muhasebe (11 Haziran - 22 Haziran)
    {
        id: "t3_1",
        title: "Banka Ticari Hesaplarının Açılması",
        description: "Şirket adına döviz ve TL hesaplarının açılması, POS ve kredi kartı başvurularının yapılması.",
        phaseId: "p3",
        assignee: "Semanur Arslan",
        priority: "Orta",
        status: "In Progress",
        startDate: "2026-06-11",
        endDate: "2026-06-14",
        estimatedHours: 6,
        onCriticalPath: false
    },
    {
        id: "t3_2",
        title: "E-Fatura, E-Arşiv & E-Defter Kurulumu",
        description: "Gelir İdaresi Başkanlığı entegrasyonu, e-imza / mali mühür alınması ve e-fatura portal entegrasyonu.",
        phaseId: "p3",
        assignee: "Ahmet Çelik",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-06-15",
        endDate: "2026-06-18",
        estimatedHours: 10,
        onCriticalPath: true
    },
    {
        id: "t3_3",
        title: "Vergi Levhası Çıkarılması ve Mali Mühür Alımı",
        description: "Şirket kurulum tescilinin tamamlanmasının ardından vergi levhasının oluşturulması ve mali mühür siparişi.",
        phaseId: "p3",
        assignee: "Ahmet Çelik",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-06-19",
        endDate: "2026-06-22",
        estimatedHours: 8,
        onCriticalPath: false
    },
    // Aşama 4: Ofis, Donanım & BT Altyapısı (15 Haziran - 28 Haziran)
    {
        id: "t4_1",
        title: "Coworking Ofis/Sözleşme Kiralama",
        description: "Yasal adres gösterimi ve ekip ortak çalışması için Kolektif House veya benzeri coworking ofis sözleşmesi.",
        phaseId: "p4",
        assignee: "Semanur Arslan",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-06-15",
        endDate: "2026-06-20",
        estimatedHours: 12,
        onCriticalPath: false
    },
    {
        id: "t4_2",
        title: "Yazılım Ekibi Donanım ve Bilgisayar Alımı",
        description: "Yazılım ekibi için 2 adet Macbook Pro donanım alımı ve lisanslı işletim sistemi kurulumları.",
        phaseId: "p4",
        assignee: "Semanur Arslan",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-06-21",
        endDate: "2026-06-24",
        estimatedHours: 8,
        onCriticalPath: false
    },
    {
        id: "t4_3",
        title: "Bulut Sunucu (AWS/GCP) Kurulumları",
        description: "Şirket organizasyonu altında AWS/GCP hesaplarının açılması ve ilk bulut sunucu konfigürasyonlarının yapılması.",
        phaseId: "p4",
        assignee: "Mert Yılmaz",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-06-23",
        endDate: "2026-06-26",
        estimatedHours: 14,
        onCriticalPath: false
    },
    {
        id: "t4_4",
        title: "Github ve Güvenlik Altyapısı Konfigürasyonu",
        description: "Şirket organizasyonu altında Github Teams hesabı açılması, 2FA güvenlik duvarlarının aktif edilmesi.",
        phaseId: "p4",
        assignee: "Mert Yılmaz",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-06-25",
        endDate: "2026-06-28",
        estimatedHours: 10,
        onCriticalPath: false
    },
    // Aşama 5: Markalama, Kurumsal Kimlik & Web (18 Haziran - 12 Temmuz)
    {
        id: "t5_1",
        title: "Logo ve Marka Kurumsal Kimlik Tasarımı",
        description: "Şirketin ruhunu yansıtan modern, minimalist bir logo ve kurumsal renk kodlarının hazırlanması.",
        phaseId: "p5",
        assignee: "Zeynep Yalçın",
        priority: "Yüksek",
        status: "In Progress",
        startDate: "2026-06-18",
        endDate: "2026-06-25",
        estimatedHours: 25,
        onCriticalPath: true
    },
    {
        id: "t5_2",
        title: "Marka Tescil Başvurusu (TPE)",
        description: "Şirket isminin Türk Patent ve Marka Kurumu nezdinde tescil edilmesi için yasal başvurunun yapılması.",
        phaseId: "p5",
        assignee: "Av. Meltem Aksoy",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-06-25",
        endDate: "2026-06-28",
        estimatedHours: 8,
        onCriticalPath: false
    },
    {
        id: "t5_3",
        title: "Kurumsal Web Sitesi Arayüz Tasarımı (UI)",
        description: "Hizmet tanıtımları, referanslar ve iletişim bölümlerini barındıran web arayüzünün Figma üzerinde çizimi.",
        phaseId: "p5",
        assignee: "Zeynep Yalçın",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-06-26",
        endDate: "2026-07-03",
        estimatedHours: 20,
        onCriticalPath: true
    },
    {
        id: "t5_4",
        title: "Web Sitesinin Responsive Kodlanması (Frontend)",
        description: "Figma arayüz tasarımlarının modern web teknolojileri ile responsive olarak canlıya alınması.",
        phaseId: "p5",
        assignee: "Selin Kaya",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-07-04",
        endDate: "2026-07-12",
        estimatedHours: 30,
        onCriticalPath: true
    },
    // Aşama 6: İK & Ekip Kurulumu (01 Temmuz - 25 Temmuz)
    {
        id: "t6_1",
        title: "Kıdemli Yazılımcı İşe Alım Mülakatları",
        description: "Kariyer portallarında iş ilanlarının açılması, adayların teknik ve davranışsal mülakatlarının yapılması.",
        phaseId: "p6",
        assignee: "Semanur Arslan",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-07-01",
        endDate: "2026-07-15",
        estimatedHours: 24,
        onCriticalPath: true
    },
    {
        id: "t6_2",
        title: "İş Sözleşmeleri ve Gizlilik Taahhütnameleri (NDA)",
        description: "Ekibe katılacak çalışanlar için iş sözleşmeleri, Fikri Mülkiyet devir sözleşmeleri ve gizlilik anlaşmaları.",
        phaseId: "p6",
        assignee: "Av. Meltem Aksoy",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-07-16",
        endDate: "2026-07-20",
        estimatedHours: 12,
        onCriticalPath: false
    },
    {
        id: "t6_3",
        title: "Ekip İçin İş Tanımları & Onboarding Kılavuzu",
        description: "Ekibe yeni katılan geliştiricilerin hızlı uyum sağlaması için onboarding dokümanının hazırlanması.",
        phaseId: "p6",
        assignee: "Mert Yılmaz",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-07-20",
        endDate: "2026-07-23",
        estimatedHours: 10,
        onCriticalPath: false
    },
    {
        id: "t6_4",
        title: "Yazılım Ekibi SGK Bildirgeleri ve Girişleri",
        description: "Mali müşavir kontrolünde ekibin SGK işyeri sicil bildirgesi ve çalışan işe giriş bildirimlerinin yapılması.",
        phaseId: "p6",
        assignee: "Ahmet Çelik",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-07-22",
        endDate: "2026-07-25",
        estimatedHours: 8,
        onCriticalPath: false
    },
    // Aşama 7: Pazarlama & Müşteri Bulma (10 Temmuz - 15 Ağustos)
    {
        id: "t7_1",
        title: "Sosyal Medya Kanalları Kurulumu & İçerik Takvimi",
        description: "Linkedin, Twitter ve Instagram kurumsal hesaplarının optimize edilmesi ve haftalık içerik planı.",
        phaseId: "p7",
        assignee: "Zeynep Yalçın",
        priority: "Düşük",
        status: "To Do",
        startDate: "2026-07-10",
        endDate: "2026-07-20",
        estimatedHours: 16,
        onCriticalPath: false
    },
    {
        id: "t7_2",
        title: "KVKK ve Gizlilik Politikası Uyum Çalışmaları",
        description: "Web sitesi, e-bülten ve müşteri verileri için KVKK aydınlatma metinleri ve çerez politikası hazırlanması.",
        phaseId: "p7",
        assignee: "Av. Meltem Aksoy",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-07-21",
        endDate: "2026-07-25",
        estimatedHours: 15,
        onCriticalPath: false
    },
    {
        id: "t7_3",
        title: "B2B E-posta ve Linkedin Tanıtım Kampanyaları",
        description: "Hedef sektörlerdeki potansiyel müşterilere yönelik kişiselleştirilmiş tanıtım e-postaları ve mesajlaşma zinciri.",
        phaseId: "p7",
        assignee: "Semanur Arslan",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-07-26",
        endDate: "2026-08-10",
        estimatedHours: 32,
        onCriticalPath: false
    },
    {
        id: "t7_4",
        title: "Müşteri Teklif Şablonları & Hizmet Kataloğu",
        description: "Potansiyel B2B müşterilere gönderilecek kurumsal teklif PDF şablonu ve hizmet sunum dosyasının tasarımı.",
        phaseId: "p7",
        assignee: "Zeynep Yalçın",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-08-10",
        endDate: "2026-08-15",
        estimatedHours: 12,
        onCriticalPath: false
    },
    // Aşama 8: Resmi Açılış & İlk Proje (12 Ağustos - 30 Ağustos)
    {
        id: "t8_1",
        title: "Lansman Paylaşımı ve Basın Duyurusu",
        description: "Sosyal medya ve dijital basın kanalları aracılığıyla şirketin faaliyete başladığının lansmanı.",
        phaseId: "p8",
        assignee: "Semanur Arslan",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-08-12",
        endDate: "2026-08-16",
        estimatedHours: 10,
        onCriticalPath: false
    },
    {
        id: "t8_2",
        title: "Teknopark / Teknokent Muafiyet Başvurusu",
        description: "Vergi teşviklerinden faydalanabilmek için Teknokent bünyesine proje sunumu ve başvuru süreci yönetimi.",
        phaseId: "p8",
        assignee: "Mert Yılmaz",
        priority: "Orta",
        status: "To Do",
        startDate: "2026-08-15",
        endDate: "2026-08-22",
        estimatedHours: 20,
        onCriticalPath: false
    },
    {
        id: "t8_3",
        title: "İlk Proje Sözleşmesinin İmzalanması ve Kick-off",
        description: "Görüşmeleri tamamlanan ilk B2B projenin sözleşmesinin imzalanması ve proje kick-off süreci.",
        phaseId: "p8",
        assignee: "Semanur Arslan",
        priority: "Yüksek",
        status: "To Do",
        startDate: "2026-08-20",
        endDate: "2026-08-30",
        estimatedHours: 24,
        onCriticalPath: true
    }
];

const DEFAULT_TRANSACTIONS = [
    {
        id: "tr_1",
        date: "2026-06-01",
        title: "Semanur Arslan Sermaye Aktarımı",
        category: "Capital",
        type: "Income",
        amount: 650000
    },
    {
        id: "tr_2",
        date: "2026-06-03",
        title: "Pazar Araştırması Rapor Satın Alımı",
        category: "Marketing",
        type: "Expense",
        amount: 12000
    },
    {
        id: "tr_3",
        date: "2026-06-08",
        title: "Avukat Noter Sözleşme Harçları",
        category: "Legal",
        type: "Expense",
        amount: 4500
    },
    {
        id: "tr_4",
        date: "2026-06-09",
        title: "Mali Müşavir Kuruluş Bedeli",
        category: "Legal",
        type: "Expense",
        amount: 7500
    },
    {
        id: "tr_5",
        date: "2026-06-11",
        title: "Macbook Pro & Yazılımcı Monitörleri",
        category: "Hardware",
        type: "Expense",
        amount: 145000
    },
    {
        id: "tr_6",
        date: "2026-06-12",
        title: "Coworking Ofis Kiralama Sözleşmesi",
        category: "Office",
        type: "Expense",
        amount: 32000
    }
];

// Grafikleri zenginleştirmek için 1 Haziran - 11 Haziran arası yoğun çalışma zaman kayıtları (TimeLogs)
const DEFAULT_TIMELOGS = [
    // 01 Haziran (Pazartesi) - Toplam 12 saat
    { id: "tl_d1_1", taskId: "t1_1", date: "2026-06-01", duration: 4, hourOfDay: 9 },
    { id: "tl_d1_2", taskId: "t1_1", date: "2026-06-01", duration: 3, hourOfDay: 11 },
    { id: "tl_d1_3", taskId: "t1_1", date: "2026-06-01", duration: 5, hourOfDay: 14 },

    // 02 Haziran (Salı) - Toplam 10 saat
    { id: "tl_d2_1", taskId: "t1_1", date: "2026-06-02", duration: 5, hourOfDay: 10 },
    { id: "tl_d2_2", taskId: "t1_1", date: "2026-06-02", duration: 3, hourOfDay: 13 },
    { id: "tl_d2_3", taskId: "t1_1", date: "2026-06-02", duration: 2, hourOfDay: 16 },

    // 03 Haziran (Çarşamba) - Toplam 11 saat
    { id: "tl_d3_1", taskId: "t1_1", date: "2026-06-03", duration: 6, hourOfDay: 9 },
    { id: "tl_d3_2", taskId: "t1_1", date: "2026-06-03", duration: 5, hourOfDay: 14 },

    // 04 Haziran (Perşembe) - Toplam 14 saat
    { id: "tl_d4_1", taskId: "t1_1", date: "2026-06-04", duration: 4, hourOfDay: 9 },
    { id: "tl_d4_2", taskId: "t1_1", date: "2026-06-04", duration: 3, hourOfDay: 11 },
    { id: "tl_d4_3", taskId: "t1_1", date: "2026-06-04", duration: 4, hourOfDay: 14 },
    { id: "tl_d4_4", taskId: "t1_1", date: "2026-06-04", duration: 3, hourOfDay: 16 },

    // 05 Haziran (Cuma) - Toplam 13 saat
    { id: "tl_d5_1", taskId: "t1_1", date: "2026-06-05", duration: 5, hourOfDay: 10 },
    { id: "tl_d5_2", taskId: "t1_1", date: "2026-06-05", duration: 4, hourOfDay: 13 },
    { id: "tl_d5_3", taskId: "t1_1", date: "2026-06-05", duration: 4, hourOfDay: 15 },

    // 08 Haziran (Pazartesi) - Toplam 16 saat
    { id: "tl_d8_1", taskId: "t1_2", date: "2026-06-08", duration: 4, hourOfDay: 8 },
    { id: "tl_d8_2", taskId: "t1_2", date: "2026-06-08", duration: 4, hourOfDay: 10 },
    { id: "tl_d8_3", taskId: "t2_1", date: "2026-06-08", duration: 5, hourOfDay: 13 },
    { id: "tl_d8_4", taskId: "t2_1", date: "2026-06-08", duration: 3, hourOfDay: 16 },

    // 09 Haziran (Salı) - Toplam 17 saat
    { id: "tl_d9_1", taskId: "t1_2", date: "2026-06-09", duration: 4, hourOfDay: 9 },
    { id: "tl_d9_2", taskId: "t1_2", date: "2026-06-09", duration: 3, hourOfDay: 11 },
    { id: "tl_d9_3", taskId: "t2_2", date: "2026-06-09", duration: 6, hourOfDay: 13 },
    { id: "tl_d9_4", taskId: "t2_2", date: "2026-06-09", duration: 4, hourOfDay: 17 },

    // 10 Haziran (Çarşamba / DÜN) - Toplam 18 saat (Detaylı Dağılım)
    { id: "tl_d10_1", taskId: "t1_2", date: "2026-06-10", duration: 3, hourOfDay: 8 },
    { id: "tl_d10_2", taskId: "t1_2", date: "2026-06-10", duration: 3, hourOfDay: 10 },
    { id: "tl_d10_3", taskId: "t2_2", date: "2026-06-10", duration: 2, hourOfDay: 11 },
    { id: "tl_d10_4", taskId: "t2_1", date: "2026-06-10", duration: 4, hourOfDay: 13 },
    { id: "tl_d10_5", taskId: "t2_1", date: "2026-06-10", duration: 4, hourOfDay: 15 },
    { id: "tl_d10_6", taskId: "t2_2", date: "2026-06-10", duration: 2, hourOfDay: 17 },

    // 11 Haziran (Perşembe / BUGÜN) - Toplam 15 saat (Detaylı Dağılım)
    { id: "tl_d11_1", taskId: "t2_1", date: "2026-06-11", duration: 3, hourOfDay: 9 },
    { id: "tl_d11_2", taskId: "t2_1", date: "2026-06-11", duration: 2, hourOfDay: 11 },
    { id: "tl_d11_3", taskId: "t3_1", date: "2026-06-11", duration: 4, hourOfDay: 13 },
    { id: "tl_d11_4", taskId: "t3_1", date: "2026-06-11", duration: 3, hourOfDay: 15 },
    { id: "tl_d11_5", taskId: "t5_1", date: "2026-06-11", duration: 3, hourOfDay: 17 }
];
