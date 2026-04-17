#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DB_PATH="${DB_PATH:-$ROOT_DIR/prisma/dev.db}"

usage() {
  cat <<EOF
Usage:
  ./scripts/query-db.sh tables
  ./scripts/query-db.sh schema <table>
  ./scripts/query-db.sh describe <table>
  ./scripts/query-db.sh query "<sql>"
  ./scripts/query-db.sh users
  ./scripts/query-db.sh cards
  ./scripts/query-db.sh expenses
  ./scripts/query-db.sh incomes
  ./scripts/query-db.sh interactive

Environment:
  DB_PATH=/custom/path.db  Override the SQLite file path.
EOF
}

ensure_db_exists() {
  if [[ ! -f "$DB_PATH" ]]; then
    echo "Database file not found: $DB_PATH" >&2
    exit 1
  fi
}

require_safe_identifier() {
  local identifier="$1"

  if [[ ! "$identifier" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    echo "Invalid identifier: $identifier" >&2
    exit 1
  fi
}

run_sql_with_python() {
  local sql="$1"

  python3 - "$DB_PATH" "$sql" <<'PY'
import sqlite3
import sys

db_path = sys.argv[1]
sql = sys.argv[2]

connection = sqlite3.connect(db_path)
connection.row_factory = sqlite3.Row

try:
    cursor = connection.execute(sql)
    if cursor.description is None:
        connection.commit()
        print("OK")
        raise SystemExit(0)

    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]

    if not rows:
        print("(no rows)")
        raise SystemExit(0)

    widths = [len(column) for column in columns]
    for row in rows:
        for index, column in enumerate(columns):
            widths[index] = max(widths[index], len(str(row[column] if row[column] is not None else "NULL")))

    def format_row(values):
        return " | ".join(str(value).ljust(widths[index]) for index, value in enumerate(values))

    print(format_row(columns))
    print("-+-".join("-" * width for width in widths))
    for row in rows:
        print(format_row([row[column] if row[column] is not None else "NULL" for column in columns]))
finally:
    connection.close()
PY
}

run_sql() {
  local sql="$1"

  if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 -header -column "$DB_PATH" "$sql"
    return
  fi

  if command -v python3 >/dev/null 2>&1; then
    run_sql_with_python "$sql"
    return
  fi

  echo "Neither sqlite3 nor python3 is available to query $DB_PATH" >&2
  exit 1
}

interactive_shell() {
  if ! command -v sqlite3 >/dev/null 2>&1; then
    echo "Interactive mode requires sqlite3 to be installed." >&2
    echo "Run: sudo apt update && sudo apt install sqlite3" >&2
    exit 1
  fi

  sqlite3 -header -column "$DB_PATH"
}

main() {
  ensure_db_exists

  local command="${1:-}"
  shift || true

  case "$command" in
    tables)
      run_sql "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
      ;;
    schema)
      local table_name="${1:-}"
      if [[ -z "$table_name" ]]; then
        usage
        exit 1
      fi
      require_safe_identifier "$table_name"
      run_sql "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = '$table_name';"
      ;;
    describe)
      local table_name="${1:-}"
      if [[ -z "$table_name" ]]; then
        usage
        exit 1
      fi
      require_safe_identifier "$table_name"
      run_sql "PRAGMA table_info('$table_name');"
      ;;
    query)
      local sql="${1:-}"
      if [[ -z "$sql" ]]; then
        usage
        exit 1
      fi
      run_sql "$sql"
      ;;
    users)
      run_sql "SELECT id, email, name, createdAt, updatedAt FROM User ORDER BY createdAt DESC LIMIT 50;"
      ;;
    cards)
      run_sql "SELECT id, userId, name, creditLimit, paymentLimit, currentBalance, lastDigits, issuer, createdAt FROM CreditCard ORDER BY createdAt DESC LIMIT 50;"
      ;;
    expenses)
      run_sql "SELECT id, userId, creditCardId, description, amount, category, date, createdAt FROM Expense ORDER BY date DESC LIMIT 100;"
      ;;
    incomes)
      run_sql "SELECT id, userId, description, amount, type, date, createdAt FROM Income ORDER BY date DESC LIMIT 100;"
      ;;
    interactive)
      interactive_shell
      ;;
    ""|-h|--help|help)
      usage
      ;;
    *)
      echo "Unknown command: $command" >&2
      usage
      exit 1
      ;;
  esac
}

main "$@"