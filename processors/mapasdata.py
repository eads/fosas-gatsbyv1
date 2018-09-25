import csv
import numpy as np
import pandas as pd
import sys

PROPS = [
    "fosas",
    "cuerpos",
    "restos",
    "restos_identificados",
    "cuerpos_identificados",
]

FIELDNAMES = [
    "id",
    "year",
    "cve_ent",
    "cve_mun",
] + PROPS


def clean_data(filename):
    with open(filename, "rb") as f:
        dfs = pd.read_excel(f, sheet_name=None)

    writer = csv.DictWriter(sys.stdout, fieldnames=FIELDNAMES)
    writer.writeheader()

    for name, df in dfs.items():
        state_code, state_name = name.split(' ', 1)

        transposed = pd.pivot_table(df, index=["state_code", "municipio_code", "year"], fill_value=0, aggfunc=np.sum, values=PROPS)

        for row in transposed.reset_index().to_dict("records"):
            cleanrow = {k: int(v) for k, v in row.items()}
            cleanrow["cve_ent"] = "{:02d}".format(cleanrow.pop('state_code'))
            cleanrow["cve_mun"] = "{:03d}".format(cleanrow.pop('municipio_code'))
            cleanrow["id"] = "{0}{cve_ent}{cve_mun}{year}".format(state_code, **cleanrow)

            writer.writerow(cleanrow)


if __name__ == "__main__":
    clean_data(sys.argv[1])
