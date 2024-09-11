---
title: Отключение двухстороннего пинга
description: Вы пытаетесь максимально замаскировать свой VPN или proxy? Тогда вам наверняка необходимо убрать определение туннеля (двусторонний пинг).
tags:
  - icmp
  - ping
  - linux
  - двухсторонний пинг
  - ICMP ping
series: server
draft: false
pubDate: 09 10 2024
---
# Краткая, но полезная заметка как отключить ответ на ICMP пинг (отключение двухстороннего пинга)

Вы пытаетесь максимально замаскировать свой VPN или proxy?

Тогда вам наверняка необходимо убрать определение туннеля (двусторонний пинг).

Перейдём к ознакомлению:

## Здесь рассматриватеся отключение определения туннеля на OC Linux и Windows

## 1. Запускаем ssh, переходим на сервер и логинимся под `root` пользователем

## 2. Переходим к редактированию настроек **ufw** c помощью nano

```bash
nano /etc/ufw/before.rules
```

## 3. Добавляем новую строку и сохраняем результат

```bash
# ok icmp codes
-A ufw-before-input -p icmp --icmp-type destination-unreachable -j DROP
-A ufw-before-input -p icmp --icmp-type source-quench -j DROP
-A ufw-before-input -p icmp --icmp-type time-exceeded -j DROP
-A ufw-before-input -p icmp --icmp-type parameter-problem -j DROP
-A ufw-before-input -p icmp --icmp-type echo-request -j DROP
```

## 4. Перезапускаем фаервол ufw
```bash
ufw disable && ufw enable
```

## 5. Сервер больше не должен отправлять ICMP трафик, а значит вам удалось скрыть двусторонний пинг!

Это одновременно может является и минусом.

Будьте внимательны, когда ограничиваете функции сервера.
 