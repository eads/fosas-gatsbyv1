CREATE TABLE IF NOT EXISTS src.mapasdata (
    id character varying(12) primary key,
    munid character varying(10),
    year integer NOT NULL,
    cve_ent character varying(2),
    cve_mun character varying(5),
    fosas integer,
    cuerpos integer,
    restos integer,
    cuerpos_identificados integer,
    restos_identificados integer,
    craneos integer
);
