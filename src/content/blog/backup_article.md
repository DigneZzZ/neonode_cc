---
title: Автоматическое резервное копирование данных с использованием Rclone и Cloudflare R2
description: Настройка скрипта для резервного копирования данных с Cloudflare R2 и уведомлений в Telegram.
tags:
  - Rclone
  - Cloudflare R2
  - Backup
  - Bash
  - Crontab
draft: false
pubDate: 09 12 2024
---

### Введение

В этой статье мы рассмотрим, как настроить автоматическое резервное копирование данных с использованием Rclone и Cloudflare R2. Мы создадим bash-скрипт, который будет создавать архив, загружать его в Cloudflare R2 и отправлять уведомления через Telegram. Также добавим этот скрипт в crontab для регулярного выполнения каждые 4 часа. Все это будет создавать архивы нашего мэйн сервера Marzban.

### Что такое Rclone?

Rclone – это клиент командной строки для обеспечения работы и синхронизации файлов и директорий с облачными хранилищами. Облачный провайдер поддерживает множество, включая Amazon S3, Google Drive, Dropbox, и, конечно, Cloudflare R2. Rclone используется для резервного копирования файлов, синхронизации файлов между различными облачными и локальными хранилищами.

#### Различные функции Rclone включают:

- **Synchronization** – синхронизация файлов между локальными хранилищами и облачными провайдерами.
- **Copy** – копирование файлов между различными папками облачного хранилища.
- **Шифрование** – шифрование файлов.
- **Automator** – работа по расписанию с использованием скриптов и crontab.
- Поддержка облачных провайдеров: Amazon S3, Google Drive, Dropbox, OneDrive, Cloudflare R2 и других.

### Что такое Cloudflare R2?

Cloudflare R2 – это хранилище объектов, предоставляемое облачной службой безопасности Cloudflare. Оно предназначено для хранения больших объемов данных с минимальными затратами и высокой производительностью. R2 предоставляет доступ к данным через API, совместимый с S3, что позволяет использовать такие инструменты, как Rclone, для управления файлами.

#### Преимущества Cloudflare R2:

- Низкие затраты: отсутствие платы за исходящий трафик.
- Высокая производительность: быстрая доставка контента благодаря глобальной сети Cloudflare.
- Совместимость с S3: возможность использования существующих инструментов и скриптов для работы с данными.
- **10ГБ пространство доступно на каждом аккаунте (в сумме всех бакетов)**

### Настройка Cloudflare R2

К сожалению, первым делом, даже чтобы воспользоваться бесплатно, вам нужно будет привязать банковскую карту к своему аккаунту Cloudflare.

[![image.png](https://openode.xyz/uploads/monthly_2024_05/image.thumb.png.351bdc0c20bd4a4851fcf04df53ef2e0.png)](https://openode.xyz/uploads/monthly_2024_05/image.png.d33a9c2aaac69e7c14ae73a220b204c1.png)

РФ карты не принимаются, но сервис Cashinout может помочь. Вы можете оформить карту в Cashinout, пройти верификацию в Cloudflare, а затем удалить карту.

### Установка и настройка Rclone

1. Установите Rclone:
    ```bash
    curl https://rclone.org/install.sh | sudo bash
    ```

2. Настройте Rclone:
    ```bash
    rclone config
    ```

3. Следуйте инструкциям для создания нового удаленного подключения:
    [![image.png](https://openode.xyz/uploads/monthly_2024_05/image.thumb.png.9bfed1df373f093c08740c00626d3dac.png)](https://openode.xyz/uploads/monthly_2024_05/image.png.63153573fb808842bd0a0f633034146f.png)

    - Remote name: `s3cf`
    - Storage: `s3`
    - AWS Access Key ID: `YOUR_CLOUDFLARE_ACCESS_KEY`
    - AWS Secret Access Key: `YOUR_CLOUDFLARE_SECRET_KEY`
    - Endpoint: `https://<account-id>.r2.cloudflarestorage.com`

    [![image.png](https://openode.xyz/uploads/monthly_2024_05/image.thumb.png.5d6d6c30634c50cb9ceca219165d2f41.png)](https://openode.xyz/uploads/monthly_2024_05/image.png.0a052fef3da53cef90e1d712b21aec5d.png)

4. Когда нужно будет указать в последнем этапе endpoint, вы можете взять их из настроек бакета.
    [![image.png](https://openode.xyz/uploads/monthly_2024_05/image.thumb.png.e04e748f2a65331e59545068b2fecc09.png)](https://openode.xyz/uploads/monthly_2024_05/image.png.2ea379c88ee8599d7c7cb77cf459483f.png)

Готово!

Чтобы проверить подключение, вы можете ввести команду:

```bash
rclone ls s3cf:openode
```

В данном случае **s3cf** – это название конфига, которое вы создавали на первом шаге `rclone config`, а **openode** – это имя бакета, созданного в Cloudflare.

### Создание и настройка bash-скрипта

1. Создайте файл скрипта `backup_script.sh` в папке `/root/`:
    ```bash
    nano /root/backup_script.sh
    ```

2. Вставьте следующий код в скрипт:

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
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"         -d chat_id="${TELEGRAM_CHAT_ID}" -d text="${MESSAGE}"
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

3. Сделайте скрипт исполняемым:
    ```bash
    chmod +x /root/backup_script.sh
    ```

4. Настройте crontab для регулярного выполнения:
    ```bash
    crontab -e
    ```

    Добавьте следующую строку:
    ```bash
    0 */4 * * * /root/backup_script.sh > /dev/null 2>&1
    ```

Готово! Скрипт будет выполняться каждые 4 часа и уведомления будут приходить в Telegram.
