import csv
import math
import numbers
import numpy as np
import pandas as pd
import sys

FIELDNAMES = [
    "id",
    "munid",
    "year",
    "state_code",
    "municipio_code",
    "fosas",
    "cuerpos",
    "restos",
    "cuerpos_identificados",
    "restos_identificados",
    "craneos",
]


def clean_data(filename):
    with open(filename, "rb") as f:
        dfs = pd.read_excel(f, sheet_name=None)

    writer = csv.DictWriter(sys.stdout, fieldnames=FIELDNAMES)
    writer.writeheader()

    for name, df in dfs.items():
        state_code, state_name = name.split(" ", 1)

        for i, row in enumerate(df.to_dict("records")):
            cleanrow = {}

            for field in FIELDNAMES:
                try:
                    fieldvalue = int(row.get(field, 0))
                    if math.isnan(fieldvalue):
                        fieldvalue = 0
                    cleanrow[field] = fieldvalue
                except ValueError:
                    cleanrow[field] = 0

            cleanrow["state_code"] = state_code

            if not row["year"]:
                cleanrow["id"] = "{0}{1}{2}".format(cleanrow["state_code"], "000", i)
                cleanrow["munid"] = "{0}{1}".format(cleanrow["state_code"], "000")
                cleanrow["municipio_code"] = None
                cleanrow["year"] = 'total'
            else:
                cleanrow["id"] = "{0}{1:03d}{2}".format(cleanrow["state_code"], int(cleanrow["municipio_code"]), i)
                cleanrow["munid"] = "{0}{1:03d}".format(cleanrow["state_code"], int(cleanrow["municipio_code"]))
                if not row["municipio_code"]:
                    cleanrow["municipio_code"] = None
                else:
                    cleanrow["municipio_code"] = "{:03d}".format(cleanrow["municipio_code"])

            writer.writerow(cleanrow)


if __name__ == "__main__":
    clean_data(sys.argv[1])
