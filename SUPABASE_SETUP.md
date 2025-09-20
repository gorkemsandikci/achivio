# 🗄️ Achivio Supabase Kurulum Kılavuzu

## 📋 Gereksinimler
- Supabase hesabı (https://supabase.com)
- Node.js 18+ yüklü
- Git

## 🚀 Adım 1: Supabase Projesi Oluşturun

1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - **Name:** `achivio-habit-tracker`
   - **Database Password:** Güçlü bir şifre seçin
   - **Region:** Size en yakın bölge
4. "Create new project" butonuna tıklayın
5. Proje oluşturulmasını bekleyin (2-3 dakika)

## 🗃️ Adım 2: Veritabanı Şemasını Oluşturun

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. "New query" butonuna tıklayın
3. `supabase-schema.sql` dosyasının içeriğini kopyalayın ve yapıştırın
4. **RUN** butonuna tıklayın
5. Başarılı mesajını bekleyin

## 📊 Adım 3: Başlangıç Verilerini Ekleyin

1. SQL Editor'da yeni bir query açın
2. `supabase-seed-data.sql` dosyasının içeriğini kopyalayın ve yapıştırın
3. **RUN** butonuna tıklayın
4. Kategoriler, görevler ve rozetlerin eklendiğini doğrulayın

## 🔑 Adım 4: API Anahtarlarını Alın

1. Supabase Dashboard'da **Settings** > **API** sekmesine gidin
2. Aşağıdaki değerleri not alın:
   - **Project URL** (URL kısmı)
   - **anon public** anahtarı
   - **service_role** anahtarı (opsiyonel, admin işlemleri için)

## ⚙️ Adım 5: Environment Variables

1. Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Achivio
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. `your_project_url_here` ve `your_anon_key_here` kısımlarını gerçek değerlerle değiştirin

## 🛡️ Adım 6: Row Level Security (RLS) Doğrulama

1. **Authentication** > **Policies** sekmesine gidin
2. Aşağıdaki tabloların RLS politikalarının aktif olduğunu doğrulayın:
   - `users`
   - `user_tasks`
   - `user_task_completions`
   - `user_badges`
   - `transactions`
   - `user_settings`

## 📱 Adım 7: Uygulamayı Test Edin

1. Development server'ı başlatın:
```bash
cd frontend
npm run dev
```

2. http://localhost:3000 adresine gidin
3. Wallet bağlantısı yapın
4. Kullanıcının veritabanında oluşturulduğunu doğrulayın:
   - Supabase Dashboard > **Table Editor** > `users` tablosuna gidin
   - Yeni kullanıcının eklendiğini görmelisiniz

## 🔍 Adım 8: Veritabanı İzleme

### Kullanıcıları Görüntüleme
```sql
SELECT wallet_address, username, level, current_streak, achiv_balance 
FROM users 
ORDER BY created_at DESC;
```

### Aktif Görevleri Görüntüleme
```sql
SELECT t.title, tc.name as category, t.difficulty, t.reward_achiv
FROM tasks t
LEFT JOIN task_categories tc ON t.category_id = tc.id
WHERE t.is_active = true
ORDER BY tc.name, t.title;
```

### Görev Tamamlamalarını Görüntüleme
```sql
SELECT u.username, t.title, utc.completed_at, utc.achiv_earned
FROM user_task_completions utc
LEFT JOIN users u ON utc.user_id = u.id
LEFT JOIN tasks t ON utc.task_id = t.id
ORDER BY utc.completed_at DESC
LIMIT 20;
```

## 🚨 Sorun Giderme

### Bağlantı Hatası
- `.env.local` dosyasının doğru konumda olduğunu kontrol edin
- Environment variable'ların doğru yazıldığını kontrol edin
- Supabase URL'inin `https://` ile başladığını kontrol edin

### RLS Hataları
- Kullanıcının `app.current_user_wallet` context'inin set edildiğini kontrol edin
- Policy'lerin doğru yazıldığını kontrol edin

### Fonksiyon Hataları
- SQL fonksiyonlarının doğru şekilde oluşturulduğunu kontrol edin
- PostgreSQL syntax'ının doğru olduğunu kontrol edin

## 📊 Veritabanı Yapısı Özeti

### Ana Tablolar:
- **users**: Kullanıcı profilleri (wallet_address ile kimlik)
- **tasks**: Sistem görevleri ve kullanıcı özel görevleri
- **user_tasks**: Kullanıcı-görev ilişkileri
- **user_task_completions**: Görev tamamlama geçmişi
- **badges**: NFT rozet tanımları
- **user_badges**: Kullanıcı rozet durumu
- **transactions**: ACHIV token işlemleri

### Önemli Fonksiyonlar:
- **complete_task()**: Görev tamamlama işlemi
- **check_and_award_badges()**: Rozet kontrolü ve ödüllendirme

## 🎯 Sonraki Adımlar

1. **Production'a Deploy**: Supabase production ortamı ayarlayın
2. **Backup Stratejisi**: Otomatik yedekleme kuralları oluşturun
3. **Monitoring**: Supabase Analytics'i aktif edin
4. **Performance**: Index'leri optimize edin

## 🆘 Destek

Sorun yaşıyorsanız:
1. Supabase Dashboard'da **Logs** sekmesini kontrol edin
2. Browser Console'da hata mesajlarını kontrol edin
3. SQL Editor'da query'leri manuel olarak test edin

---

✅ **Kurulum tamamlandığında, Achivio uygulamanız tamamen Supabase ile entegre çalışmaya hazır olacak!**
