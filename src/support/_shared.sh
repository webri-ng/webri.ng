#!/usr/bin/env bash

function die_with_message {
	echo "$1" >&2
	exit 1
}


function prompt_to_confirm {
	read -r -n 1 -p "Please press ENTER to confirm." var
	if [ ${#var} -ne 0 ]; then
		echo "Aborted."
		exit 1
	fi
}


# Checks if a program can be found in your PATH.
# Outputs 1 if so, nothing if not.
# @param {String} program - The program to check for.
function check_program_in_PATH {
	local program="${1}"
	command -v "${program}" >&/dev/null && echo "1" >&/dev/null
}


# Tests a database connection, lists all available databases.
function test_db_connection {
	local connection_string="postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db}"
	echo "Testing connection to '${connection_string}'..."
	psql --quiet --no-password "${connection_string}" -l >&/dev/null
}


# Executes a script on the database connection.
# Uses the connection string constructed from the standard env vars used in all
# of the helper scripts: "postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db}"
# @param {String} script_file - The path to the script to execute.
function run_db_script {
	local script_file="${1}"
	[[ -f "${script_file}" ]] || die_with_message "Cannot read data file '${script_file}'! Exiting."
	echo "Running ${script_file}..."
	local connection_string="postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db}"
	psql --quiet --no-password "${connection_string}" -f "${script_file}"
}


# Gets the name of a postgres sequence.
# Useful when importing rows from csv.
# @param {String} TABLE_NAME - the name of the table the sequence is in.
# @param {String} COLUMN_NAME - the name of the column the sequence is attached to.
function get_pg_sequence_value {
	local schema_name="webring"
	local table_name="${1}"
	local column_name="${2}"
	local connection_string="postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db}"
	local get_seq_command="SELECT pg_get_serial_sequence('${schema_name}.${table_name}', '${column_name}')"

	# Avoid masking the return value.
	# Refer to: https://unix.stackexchange.com/questions/506352/bash-what-does-masking-return-values-mean
	local seq_name
	seq_name="$(echo "${get_seq_command}" | psql -t --quiet --no-password "${connection_string}")"

	echo "${seq_name}"
}


# Update table primary key sequence to match the latest value in the id column.
# \COPY does NOT automatically set seq if we are copying all columns.
# See: https://www.postgresql.org/docs/current/sql-createsequence.html
# See: https://stackoverflow.com/questions/9091781/why-sequences-are-not-updated-when-copy-is-performed-in-postgresql
# @param {String} table_name - The name of the table to import the data to.
function update_pg_seq {
	local table_name="${1}"
	local connection_string="postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db}"
	seq_name="$(get_pg_sequence_value "${table_name}" "${table_name}_id")"
	set_seq_command="SELECT setval('${seq_name}', max(${table_name}_id)) FROM webring.${table_name};"
	psql -o /dev/null --quiet --no-password "${connection_string}" -c "${set_seq_command}" || die_with_message "Error setting seq '${seq_name}'! Exiting."
	echo "Set sequence '${seq_name}'."
}


# Imports data from a CSV file to a database table.
# Uses the connection string constructed from the standard env vars used in all
# of the I4T helper scripts: "postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db}"
# Updates the id sequences manually. See comments.
# @param {String} data_file - The path to the csv file to import.
# @param {String} table_name - The name of the table to import the data to.
function import_csv {
	local data_file="${1}"
	local table_name="${2}"
	[[ -f "${data_file}" ]] || die_with_message "Cannot read data file '${data_file}'! Exiting."

	local connection_string="postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db}"
	psql --quiet --no-password "${connection_string}" -c "\COPY webring.${table_name} FROM '${data_file}' DELIMITER ',' CSV HEADER;" || die_with_message "Error importing '${data_file}'! Exiting."

	# Update any serial id sequence.
	update_pg_seq "${table_name}"
	echo "Imported '${data_file}' into '${table_name}'."
}
