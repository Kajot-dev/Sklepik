# Instrukcje uruchomienia

## 1. Instalacja nodejs
Należy mieć zainstalowany `nodejs` warz z `npm` (node package manager), `npm` instaluje się automatycznie razem z `nodejs`. Program można pobrać z [tej strony](https://nodejs.org) (**Notka:** Strona była tworzona za pomocą wersji **14** `nodejs`). Podczas instalacji zwróć uwagę, aby dodać program do `PATH` (Windows). 

## 2. Instalacja zależności (bibliotek)
Należy wejść w konsoli do foleru głównego (tego, w którym jest plik package.json)

I jednorazowo uruchomić komendę:

```bash
npm install
```

Ta komenda zainstaluje lokalnie (folder node_modules) biblioteki potrzebne do uruchomienia serwera (część front-end nie używa żadnych).

## 3. Uruchamianie strony
Aby uruchomić serwer lokalnie użyć komedy w folderze głównym (patrz wyżej):

```bash
npm run start-local
```

# Dostępność online

## Dodatkowo strona jest dostępna online [tutaj.](https://witty-shop.herokuapp.com)

### UWAGA
 - Ponieważ baza danych jest zapisywana w plikach .json, z uwagi na to, że heroku nie zapisuje zmian w plikach, baza resetuje się po restarcie serwera (nie powinno mieć miejsca przy uruchamianiu lokalnym)
 - Z racji darmowego hostingu po 30 minutach nieaktywności strona jest usypiana i potrzebuje kilkunastu sekund żeby się uruchomić.
