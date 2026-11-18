# Gear Slot

Gear Slot — приложение для бронирования общего оборудования учебных заведений и организаций. Пользователь может найти оборудование, выбрать интервал и отменить свою бронь. Администратор также может добавлять позиции в каталог.

**Стек** — Nuxt 4, Vue 3 Composition API, TypeScript, Nuxt UI 4, Tailwind CSS 4 и ESLint. API работает в отдельном репозитории на Go, Gin, GORM и PostgreSQL.

## Первый запуск на Windows через WSL 2

Понадобятся Ubuntu в WSL и доступ к [репозиторию Go API](https://github.com/ETU-devs/gear-slot-be). Оба приложения запускаются внутри одной Ubuntu. В браузере Windows нужно будет открыть только фронтенд.

### 1. Установите Ubuntu в WSL

Если Ubuntu уже работает в WSL 2, переходите к следующему шагу. Иначе откройте **PowerShell от имени администратора** и выполните:

```powershell
wsl --install -d Ubuntu
```

Если Windows попросит, перезагрузите компьютер. Откройте **Ubuntu** из меню «Пуск» и при первом запуске создайте пользователя Linux. Проверить версию WSL можно командой `wsl -l -v` в PowerShell. У Ubuntu в столбце `VERSION` должно стоять `2`. [Инструкция Microsoft по установке WSL](https://learn.microsoft.com/ru-ru/windows/wsl/install).

Дальше все команды выполняйте в терминале **Ubuntu**. Храните проекты в домашней папке Linux, например в `~/projects`.

### 2. Установите Node.js и скачайте фронтенд

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
```

В проекте используется **Node.js 24** и **npm 11**. Если этих версий ещё нет в Ubuntu, установите их через nvm. [Документация nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh -o /tmp/gear-slot-nvm-install.sh
bash /tmp/gear-slot-nvm-install.sh
source ~/.bashrc
nvm install 24
node -v
npm -v
```

Проверьте, что `node -v` показывает `v24.x.x`, а `npm -v` — `11.x.x`.

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/ETU-devs/gear-slot-fe.git
cd gear-slot-fe
npm ci
cp -n .env.example .env
```

`npm ci` устанавливает зависимости из `package-lock.json`. В `.env` уже указан стандартный адрес Go API `http://127.0.0.1:8080`. Если API уже запущен на этом адресе, переходите к шагу 4. Если он работает на другом адресе, впишите его в `NUXT_BACKEND_URL`.

### 3. Запустите Go API и PostgreSQL

В отдельной вкладке Ubuntu установите **Go 1.27 или новее**, если его ещё нет. Для WSL выберите Linux в официальной инструкции. После установки проверьте команду `go version` в терминале Ubuntu. [Установка Go](https://go.dev/doc/install).

```bash
cd ~/projects
git clone https://github.com/ETU-devs/gear-slot-be.git
cd gear-slot-be
sudo apt install -y postgresql openssl nano
sudo service postgresql start
pg_isready -h 127.0.0.1 -p 5432
```

Если GitHub запрашивает доступ к репозиторию бэкенда, войдите в аккаунт команды или попросите владельца выдать доступ. `pg_isready` должен сообщить `accepting connections`. Для новой локальной базы выполните следующие команды. Первая предложит придумать пароль для пользователя PostgreSQL `gear_slot`. Для локального запуска можно использовать длинный пароль из букв и цифр, чтобы его было проще вставить в адрес базы.

```bash
(cd /tmp && sudo -u postgres createuser --pwprompt gear_slot)
(cd /tmp && sudo -u postgres createdb --owner=gear_slot gear_slot)
cp -n .env.example .env
openssl rand -hex 32
nano .env
```

В файле бэкенда `.env` замените `CHANGE_ME` в строке `DATABASE_URL` на пароль, который вы задали для PostgreSQL. Если в пароле есть специальные символы URI, например `@`, `:` или `#`, в URL их нужно закодировать. Вставьте строку из `openssl` в `JWT_SECRET`. Оставьте `HTTP_ADDR=127.0.0.1:8080`. Для сохранения в nano нажмите **Ctrl+O**, **Enter**, затем **Ctrl+X**.

```bash
set -a
source .env
set +a
go mod download
go run ./cmd/migrate up
go run ./cmd/seed
go run ./cmd/api
```

Миграции создают таблицы, а команда `seed` наполняет каталог примерами оборудования. Оставьте Go API запущенным. Подробные настройки базы описаны в [README бэкенда](https://github.com/ETU-devs/gear-slot-be#readme).

### 4. Запустите фронтенд и проверьте работу

Вернитесь в первую вкладку Ubuntu или откройте новую:

```bash
cd ~/projects/gear-slot-fe
npm run dev
```

В браузере Windows откройте [http://localhost:3000](http://localhost:3000). Нажмите «Создать аккаунт», зарегистрируйтесь и войдите. В каталоге появится оборудование, загруженное командой `seed`. Откройте карточку доступного предмета, забронируйте время и проверьте результат в разделе «Мои бронирования».

Если Nuxt выбрал другой порт, откройте адрес из его вывода в терминале. Если приложение сообщает, что сервис недоступен, проверьте, что Go API работает во второй вкладке и что `NUXT_BACKEND_URL` совпадает с его адресом. После изменения `.env` перезапустите Nuxt.

### Как назначить первого администратора

Сначала зарегистрируйте аккаунт в интерфейсе. Затем в новой вкладке Ubuntu выполните команду с email этого аккаунта:

```bash
cd ~/projects/gear-slot-be
set -a
source .env
set +a
go run ./cmd/admin admin@example.com
```

После обновления страницы каталога появится кнопка «Добавить оборудование».

## Маршруты

| Страница | Назначение |
| --- | --- |
| `/` | Перенаправляет в каталог при действующей сессии или на страницу входа. |
| `/login` | Вход. |
| `/register` | Создание аккаунта. |
| `/equipment` | Защищённый каталог, поиск по названию, фильтр по статусу, создание брони и добавление позиций для администратора. |
| `/bookings` | Защищённый список собственных броней с отменой. |

## SSR и сессия

Браузер обращается к API Nuxt по тому же origin. Nitro вызывает Go по адресу из приватной конфигурации. SSR передаёт cookie текущего запроса в Nitro через `useRequestFetch`. Middleware страницы проверяет сессию через `/api/auth/me` перед рендерингом и при переходе между страницами. Серверные данные страницы передаются клиенту в payload Nuxt. Состояние текущего пользователя в `useState` изолировано по SSR-запросам.

При входе Nitro записывает JWT в HttpOnly cookie с `SameSite=Lax`, путём `/` и сроком действия из Go. Для HTTPS cookie получает флаг `Secure`. JWT доступен только серверу Nuxt, который отправляет его Go заголовком `Authorization: Bearer`. POST и DELETE требуют точного совпадения `Origin` с origin приложения. При 401 от защищённого маршрута сессия сбрасывается. При выходе Go отзывает сессию, после чего Nitro удаляет cookie. Предпочтение темы хранит встроенный color mode Nuxt UI в отдельной cookie.

## Структура

- `app/pages/` — страницы и запросы к Nitro.
- `app/layouts/`, `app/components/` — оболочки страниц, навигация, карточки и формы.
- `app/composables/`, `app/middleware/`, `app/utils/` — сессия, маршрутизация и представление данных.
- `app/assets/css/` — глобальные стили и темы.
- `server/api/`, `server/utils/` — серверный прокси Nitro к Go.
- `shared/types/` — типы API для Nuxt и Nitro.

## Ручная проверка

1. Зарегистрируйте аккаунт. Повторная регистрация с тем же email должна показать ошибку. Войдите и обновите каталог, чтобы проверить восстановление сессии.
2. Введите часть названия и выберите статус. Проверьте результаты, URL и пустое состояние. Кнопка бронирования должна быть отключена для оборудования на обслуживании.
3. Назначьте администратора и добавьте оборудование из каталога. Новая карточка появится, если она подходит под текущий фильтр.
4. Забронируйте доступное оборудование. Время при выборе указано в часовом поясе устройства. Повторите бронирование для пересекающегося интервала и проверьте сообщение о конфликте.
5. На странице «Мои бронирования» проверьте название и время, затем подтвердите отмену. В другом аккаунте эта бронь не должна отображаться.
6. Переключите тему и обновите страницу. Выйдите из аккаунта и откройте напрямую `/equipment` или `/bookings`: приложение перенаправит на вход.

## Проверки и production

```bash
npm ci
npm run lint
npm run typecheck
npm run build
NUXT_BACKEND_URL=http://127.0.0.1:8080 node .output/server/index.mjs
```

В production передайте переменные окружения процессу Node.js. При размещении за HTTPS-прокси задайте `NUXT_APP_ORIGIN` с внешним HTTPS-адресом без пути и завершающего слеша. GitHub Actions запускает установку из npm lockfile, линтер, проверку типов и сборку на push и pull request.
