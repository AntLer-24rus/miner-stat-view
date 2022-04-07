[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Miner stat view

Просмотр статистики майнера в виде веб странички

Для запуска приложения необходимо:

1. Склонировать репозиторий к себе

   ```bash
   git clone https://github.com/AntLer-24rus/miner-stat-view.git
   ```

1. Перейти в папку проекта и установить зависимости

   ```bash
   cd miner-stat-view && npm install
   ```

1. Собрать клиентскую часть

   ```bash
   npm run build:client
   ```

1. запустить основной сервер

   ```bash
   npm run start:server
   ```

Сервер будет запущен на http://localhost:3000 по умолчанию

Далее необходимо склонировать этот же проект на майнер (Raspberry Pi), установить зависимости и запустить агента, предварительно создав для него конфигурационный файл `src/agent/config.json` со следующим содержимым

```json
{
  "miner-conf-path": "/path/to/miner.conf",
  "host": "<Имя или IP машины где запущен сервер>",
  "port": "<Номер пота>"
}
```

После чего запустить агента

```bash
tail -f -n0 path/to/miner.log | npm run start:agent
```

После после запуска всех составляющий статистика на страничке будет обновляться автоматически, с частотой следования логов от майнера

## Для режима разработки

Можно запустить приложение в режиме разработки со всеми его частями на одной машине. Для этого необходимо создать два файла в корне проекта: `dev-miner-conf.conf`

```
pool user_name=test_pool_name
pool host_name=test_pool_host
pool port=3442
```

и `dev-miner-log.log`

```
------------------------------------------------------------
-----                  STATISTIC                       -----
------------------------------------------------------------
*** BOARDS SYS INFO (19 boards, 1368 chips):
BRD  FOUND      REV   SPI    PWR  CHIPS  OH    T  RevADC      I, ma
  1      1  BREV:20  1x 9  1x9x8     72   0  24C    1688   I0:   20
  2      1  BREV:20  1x 9  1x9x8     72   0  25C    1677   I0:   27
  3      1  BREV:20  1x 9  1x9x8     72   0  25C    1686   I0:   20
  4      1  BREV:20  1x 9  1x9x8     72   0  25C    1686   I0:   27
  5      1  BREV:20  1x 9  1x9x8     72   0  25C    1685   I0:   27
  6      1  BREV:20  1x 9  1x9x8     72   0  25C    1689   I0:   20
  7      1  BREV:20  1x 9  1x9x8     72   0  25C    1686   I0:   40
  8      1  BREV:20  1x 9  1x9x8     72   0  26C    1686   I0:   27
  9      1  BREV:20  1x 9  1x9x8     72   0  25C    1686   I0:   40
 11      1  BREV:20  1x 9  1x9x8     72   0  24C    1680   I0:   40
 12      1  BREV:20  1x 9  1x9x8     72   0  25C    1684   I0:   20
 15      1  BREV:20  1x 9  1x9x8     72   0  24C    1689   I0:   20
 16      1  BREV:20  1x 9  1x9x8     72   0  25C    1686   I0:   27
 17      1  BREV:20  1x 9  1x9x8     72   0  26C    1684   I0:   40
 18      1  BREV:20  1x 9  1x9x8     72   0  26C    1687   I0:   20
 19      1  BREV:20  1x 9  1x9x8     72   0  25C    1682   I0:   20
 20      1  BREV:20  1x 9  1x9x8     72   0  25C    1684   I0:   34
 21      1  BREV:20  1x 9  1x9x8     72   0  24C    1689   I0:   20
 22      1  BREV:20  1x 9  1x9x8     72   0  25C    1681   I0:   27

*** BOARDS I/OSC INFO:
BRD  I, ma  TRG  dOSC
  1     20    0    +0
  2     27    0    +0
  3     20    0    +0
  4     27    0    +0
  5     27    0    +0
  6     20    0    +0
  7     40    0    +0
  8     27    0    +0
  9     40    0    +0
 11     40    0    +0
 12     20    0    +0
 15     20    0    +0
 16     27    0    +0
 17     40    0    +0
 18     20    0    +0
 19     20    0    +0
 20     34    0    +0
 21     20    0    +0
 22     27    0    +0

*** BOARDS RFID DATA:
BRD                   UID                        TAG
  1  04:7d:4c:e2:07:3c:80  10115050110034542|2; KJ
  2  04:80:4c:e2:07:3c:80  10115050110034545|2; KJ
  3  04:39:a5:3a:18:3a:80  10115060010080461|1;KJN
  4  04:5d:18:e2:07:3c:80  10115050110034945|2; KJ
  5  04:96:4c:82:07:3c:80  10115050110034877|2; KJ
  6  04:5c:14:e2:07:3c:80  10115050110034927|2; KJ
  7  04:b4:a6:4a:18:3a:80  10115060010090582|2;KJP
  8  04:92:0d:e2:07:3c:80  10115050110034869|2; KJ
  9  04:18:91:4a:18:3a:80  10115100010001708|1;KJS
 11  04:6d:32:4a:18:3a:80  10115060010090581|2;KJP
 12  04:8c:78:e2:07:3c:80  10115050110034375|2; KJ
 15  04:3d:14:e2:07:3c:80  10115050110034606|2; KJ
 16  04:41:1b:6a:89:3a:80  10115050110000897|1;KJR
 17  04:6b:a5:4a:18:3a:80  10115060010090583|2;KJP
 18  04:37:15:e2:07:3c:80  10115050110034602|2; KJ
 19  04:3b:19:e2:07:3c:80  10115050110034603|2; KJ
 20  04:7e:4c:e2:07:3c:80  10115050110034543|2; KJ
 21  04:3c:14:e2:07:3c:80                    1011505
 22  04:5b:0e:da:8c:3a:80  10115060010080261|1;KJR

*** BOARDS STAT DELTA (10 secs, 19 boards, 1368 chips):
BRD  SOL  ERR   bySol  E/S  JOBS  CR  W/GHs  EPWC
  1    0    0  0 GH/s   0%     0   0   0.00     9
  2    0    0  0 GH/s   0%     0   0   0.00     9
  3    0    0  0 GH/s   0%     0   0   0.00     9
  4    0    0  0 GH/s   0%     0   0   0.00     9
  5    0    0  0 GH/s   0%     0   0   0.00     9
  6    0    0  0 GH/s   0%     0   0   0.00     9
  7    0    0  0 GH/s   0%     0   0   0.00     9
  8    0    0  0 GH/s   0%     0   0   0.00     9
  9    0    0  0 GH/s   0%     0   0   0.00     9
 11    0    0  0 GH/s   0%     0   0   0.00     9
 12    0    0  0 GH/s   0%     0   0   0.00     9
 15    0    0  0 GH/s   0%     0   0   0.00     9
 16    0    0  0 GH/s   0%     0   0   0.00     9
 17    0    0  0 GH/s   0%     0   0   0.00     9
 18    0    0  0 GH/s   0%     0   0   0.00     9
 19    0    0  0 GH/s   0%     0   0   0.00     9
 20    0    0  0 GH/s   0%     0   0   0.00     9
 21    0    0  0 GH/s   0%     0   0   0.00     9
 22    0    0  0 GH/s   0%     0   0   0.00     9

*** BOARDS STAT TOTAL (709 secs, 19 boards, 1368 chips):
BRD  SOL  ERR   bySol  E/S  JOBS  CR  W/GHs  EPWC
  1    0    0  0 GH/s   0%     0   0   0.00     9
  2    0    0  0 GH/s   0%     0   0   0.00     9
  3    0    0  0 GH/s   0%     0   0   0.00     9
  4    0    0  0 GH/s   0%     0   0   0.00     9
  5    0    0  0 GH/s   0%     0   0   0.00     9
  6    0    0  0 GH/s   0%     0   0   0.00     9
  7    0    0  0 GH/s   0%     0   0   0.00     9
  8    0    0  0 GH/s   0%     0   0   0.00     9
  9    0    0  0 GH/s   0%     0   0   0.00     9
 11    0    0  0 GH/s   0%     0   0   0.00     9
 12    0    0  0 GH/s   0%     0   0   0.00     9
 15    0    0  0 GH/s   0%     0   0   0.00     9
 16    0    0  0 GH/s   0%     0   0   0.00     9
 17    0    0  0 GH/s   0%     0   0   0.00     9
 18    0    0  0 GH/s   0%     0   0   0.00     9
 19    0    0  0 GH/s   0%     0   0   0.00     9
 20    0    0  0 GH/s   0%     0   0   0.00     9
 21    0    0  0 GH/s   0%     0   0   0.00     9
 22    0    0  0 GH/s   0%     0   0   0.00     9

*** MASTER STATS PER INTERVAL:
INTERVAL   sec  bySol  byDiff  byPool  byJobs  CHIP avg  SOL  ERR  ERR(%)  CR
  30 sec   10s    0.0     0.0     0.0     0.0  0.00 GHs    0    0    0.0%   0
   5 min  104s    0.0     0.0     0.0     0.0  0.00 GHs    0    0    0.0%   0
  15 min  314s    0.0     0.0     0.0     0.0  0.00 GHs    0    0    0.0%   0
  1 hour  709s    0.0     0.0     0.0     0.0  0.00 GHs    0    0    0.0%   0
   total  709s    0.0     0.0     0.0     0.0  0.00 GHs    0    0    0.0%   0

*** MASTER STATS:
Date: 17.10.21 16:17:07, UpTime: 709 secs, Diff: 40000
Found boards:   19
Broken SPI:     19
Safe Start:      0
Server U:         0.0 V
Server I:         0.5 A
Server W:           0 W
Server W/GHs:    0.00 W/GHs
*** POOL STATS:
Pool: host:port: sha256.eu-north.nicehash.com:3334, user: 3CCcUmEyB6QynwSVF8v7GmXGEG5sU2kLZr.B48-4, diff: 40000
extraNonce1: b7634c298f, extraNonce2Size: 3, jobs: 7
INTERVAL   sec  JOBS  clean  SHARES  ok  err  POOL sol  loss  INSERVICE       %
  30 sec   10s     0      0       0   0    0         0  0.0%        11s  100.0%
   5 min  104s     3      0       0   0    0         0  0.0%       105s  100.0%
  15 min  314s    13      3       0   0    0         0  0.0%       309s   98.3%
  1 hour  709s    31     13       0   0    0         0  0.0%       670s   95.4%
   total  709s    31     13       0   0    0         0  0.0%       670s   95.4%

*** EVENT STATS:
Legend: OH - overheat, DIFF - diff changes, REC - reconnects, RECE - reconnects on error
        SHARES - sent to pool, PSS - pwc shares sent, PSD - pwc shares dropped
        DJS - default job shares, SJS - stale job shares, DUP - duplicates, LDS - low diff shares
        BDS - big diff shares, BTS - below target shares
INTERVAL   sec  OH  DIFF  REC  RECE  SHARES  PSS  PSD  DJS  SJS  DUP  LDS  BDS  BTS
  30 sec   10s   0     0    0     0       0    0    0    0    0    0    0    0    0
   5 min  104s   0     0    0     0       0    0    0    0    0    0    0    0    0
  15 min  314s   0     2    1     1       0    0    0    0    0    0    0    0    0
  1 hour  709s   0     9    6     6       0    0    0    0    0    0    0    0    0
   total  709s   0     9    6     6       0    0    0    0    0    0    0    0    0

*** SYSTEM STATS:
PSU: 0.0V, FAN: 0.0V
FAN:        0     1     2     3     4     5
RPM:        0     0     0     0     0     0
FAN RPM (min/avr/max): 0 / 0 / 0
Temp(C) (cold/min/avr/max): 0 / 24 / 24 / 26
*** MASTER-SLAVE SPI BUS STATS:
SLAVE    VER   TIME  PING    M=>S   rx  err     %    S=>M   rx  err     %
    0  31.41   692s    10     134  131    0  0.0%     131  131    0  0.0%
    1  31.41   692s    10     134  124    0  0.0%     124  124    0  0.0%
    2  31.41   693s    10     134  127    0  0.0%     127  127    0  0.0%
    3  31.41   693s    10     134  131    0  0.0%     131  131    0  0.0%
    4  31.41   693s    10     134  132    0  0.0%     132  132    0  0.0%
    5  31.41   693s     9     134  126    0  0.0%     126  126    0  0.0%
    6  31.41   693s     9     134  127    0  0.0%     127  127    0  0.0%
    7  31.41   693s     9     134  131    0  0.0%     131  131    0  0.0%

SPI Broadcasts: 0
Total packets: 1072, speed: 4.39 packets/sec
Exporting stat... [done]
```

В конфигурационном файле агента указать путь до `dev-miner-conf.conf`, при этом остальные переменные можно не указывать. Агент автоматически будет пытаться подключится к адресу http://localhost:3000.
Запустить из коня проекта командой

```bash
tail -f -n 0 dev-miner-log.log | npm run start:agent -- -d
```

Далее в отдельном окне терминала запустить сервер в режиме разработки

```bash
npm run dev:server
```

И также в отдельном окне терминала, клиент в режиме разработки

```bash
npm run dev:client
```

Для отсылки статистики в файл `dev-miner-log.log` можно вносить изменения согласно той разметки которая в нем представлена. Все изменения будут отображаться на веб страничке а также в логах терминалов
