CREATE TABLE "translations" (
	"lang_id" integer NOT NULL,
	"kANDa_num" smallint NOT NULL,
	"sarga_num" smallint NOT NULL,
	"shloka_num" smallint NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	CONSTRAINT "translations_lang_id_kANDa_num_sarga_num_shloka_num_pk" PRIMARY KEY("lang_id","kANDa_num","sarga_num","shloka_num")
);
