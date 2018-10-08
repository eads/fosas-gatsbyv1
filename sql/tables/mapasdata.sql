CREATE TABLE IF NOT EXISTS mapasdata (
    id character varying(6) primary key,
    year integer NOT NULL,
    cve_ent character varying,
    cve_mun character varying,
    fosas integer,
    cuerpos integer,
    restos integer,
    cuerpos_identificados integer,
    restos_identificados integer,
    craneos integer
);
