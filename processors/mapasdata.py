import csv
import math
import numbers
import numpy as np
import pandas as pd
import sys

FIELDNAMES = [
    "id",
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
        if state_code == "00":
            continue

        for i, row in enumerate(df.to_dict("records")):
            if (isinstance(row["state_code"], numbers.Number) and math.isnan(row["state_code"])):
                continue

            cleanrow = {}
            for field in FIELDNAMES:
                try:
                    fieldvalue = int(row.get(field, 0))
                    if math.isnan(fieldvalue):
                        fieldvalue = 0
                except ValueError:
                    pass
                cleanrow[field] = fieldvalue

            cleanrow["state_code"] = "{:02d}".format(cleanrow["state_code"])
            cleanrow["municipio_code"] = "{:03d}".format(cleanrow["municipio_code"])
            cleanrow["id"] = "{0}{1}".format(cleanrow["state_code"], i)
            writer.writerow(cleanrow)


if __name__ == "__main__":
    clean_data(sys.argv[1])
