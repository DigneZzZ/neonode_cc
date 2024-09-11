---
title: "Автоматическое резервное копирование данных с использованием Rclone и Cloudflare R2"
description: "Настройка скрипта для резервного копирования данных с Cloudflare R2 и уведомлений в Telegram."
tags:
  - Rclone
  - Cloudflare R2
  - Backup
  - Bash
  - Crontab
series: server-tools
draft: false
pubDate: 09 12 2024
---

## Введение

В этой статье мы рассмотрим, как настроить автоматическое резервное копирование данных с использованием Rclone и Cloudflare R2. Мы создадим bash-скрипт, который будет создавать архив, загружать его в Cloudflare R2 и отправлять уведомления через Telegram. Также добавим этот скрипт в crontab для регулярного выполнения каждые 4 часа. Все это будет создавать архивы нашего мэйн сервера Marzban.

## Что такое Rclone?

Rclone – это клиент командной строки для работы с облачными хранилищами. Он поддерживает множество провайдеров, включая Amazon S3, Google Drive, Dropbox и Cloudflare R2. Rclone используется для резервного копирования и синхронизации файлов.

### Основные функции Rclone:

- **Synchronization** – синхронизация данных между локальными и облачными хранилищами.
- **Copy** – копирование файлов между папками облачного хранилища.
- **Шифрование** – защита данных с помощью шифрования.
- **Automator** – автоматизация задач с использованием crontab.
- Поддержка множества облачных провайдеров, включая Cloudflare R2.

## Что такое Cloudflare R2?

Cloudflare R2 – это объектное хранилище, предоставляемое Cloudflare. Оно предлагает высокую производительность и низкие затраты, а также доступ к данным через API, совместимый с S3.

### Преимущества Cloudflare R2:

- **Низкие затраты**: нет платы за исходящий трафик.
- **Высокая производительность**: быстрая доставка данных через сеть Cloudflare.
- **Совместимость с S3**: можно использовать существующие инструменты для управления данными.

## Настройка Cloudflare R2

Прежде чем начать использовать Cloudflare R2, нужно привязать банковскую карту к аккаунту.

![Cloudflare R2](https://openode.xyz/uploads/monthly_2024_05/image.thumb.png.351bdc0c20bd4a4851fcf04df53ef2e0.png)

Если карта РФ не принимается, можно воспользоваться сервисом Cashinout для верификации в Cloudflare.

## Установка и настройка Rclone

### Шаг 1: Установка Rclone

```bash
curl https://rclone.org/install.sh | sudo bash
```

### Шаг 2: Настройка Rclone

```bash
rclone config
```

### Шаг 3: Создание нового подключения

![Rclone Setup](https://openode.xyz/uploads/monthly_2024_05/image.thumb.png.9bfed1df373f093c08740c00626d3dac.png)

- Название подключения: `s3cf`
- Тип хранилища: `s3`
- AWS Access Key ID: `YOUR_CLOUDFLARE_ACCESS_KEY`
- AWS Secret Access Key: `YOUR_CLOUDFLARE_SECRET_KEY`
- Endpoint: `https://<account-id>.r2.cloudflarestorage.com`

![Rclone Config](https://openode.xyz/uploads/monthly_2024_05/image.thumb.png.5d6d6c30634c50cb9ceca219165d2f41.png)

### Шаг 4: Убедитесь, что настройки бакета совпадают

![Bucket Setup](https://openode.xyz/uploads/monthly_2024_05/image.thumb.png.e04e748f2a65331e59545068b2fecc09.png)

## Тестирование подключения

Чтобы убедиться, что подключение установлено корректно, выполните команду:

```bash
rclone ls s3cf:openode
```

## Создание bash-скрипта для автоматизации резервного копирования

### Шаг 1: Создание скрипта

Создайте файл `backup_script.sh` в папке `/root/`:

```bash
nano /root/backup_script.sh
```

### Шаг 2: Вставка кода

Вставьте следующий код в скрипт:

```bash
#!/bin/bash

# Переменные для Telegram
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"

# Папки для архивации
SRC_DIRS=("/opt/marzban" "/var/lib/marzban")

# Папка для хранения архива
DEST_DIR="/root"

# Имя архива с датой и временем
DATE=$(date +'%Y-%m-%d_%H-%M-%S')
ARCHIVE_NAME="OPENODE_backup_$DATE.zip"
ARCHIVE_PATH="$DEST_DIR/$ARCHIVE_NAME"

# Создание архива
zip -r "$ARCHIVE_PATH" "${SRC_DIRS[@]}"

# Целевая папка в Cloudflare R2
TARGET_DIR="s3cf:openode/"

# Функция для отправки уведомления в Telegram
send_telegram_message() {
    local MESSAGE=$1
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"     -d chat_id="${TELEGRAM_CHAT_ID}" -d text="${MESSAGE}"
}

# Загрузка архива в Cloudflare R2 и отправка уведомления
if rclone copy "$ARCHIVE_PATH" "$TARGET_DIR"; then
    send_telegram_message "Архив $ARCHIVE_NAME успешно загружен в Cloudflare R2."
    rm "$ARCHIVE_PATH"
else
    send_telegram_message "Ошибка при загрузке архива $ARCHIVE_NAME в Cloudflare R2."
fi

# Ротация архивов в Cloudflare R2 (оставить только за последние 7 дней)
rclone delete --min-age 7d "$TARGET_DIR"
```

### Шаг 3: Сделать скрипт исполняемым

```bash
chmod +x /root/backup_script.sh
```

### Шаг 4: Настройка crontab

Настройте crontab для выполнения скрипта каждые 4 часа:

```bash
crontab -e
```

Добавьте строку:

```bash
0 */4 * * * /root/backup_script.sh > /dev/null 2>&1
```

Готово! Скрипт будет запускаться каждые 4 часа и отправлять уведомления в Telegram.
