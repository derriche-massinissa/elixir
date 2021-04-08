SET client_encoding = 'UTF8';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

CREATE TABLE boards (
	board_id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUID_GENERATE_V4(),
	title VARCHAR (512) NOT NULL,
	description TEXT,
	starred BOOLEAN NOT NULL DEFAULT FALSE,
	closed BOOLEAN NOT NULL DEFAULT FALSE,
	background_type VARCHAR(8) NOT NULL,
	background_value VARCHAR(512) NOT NULL,
	create_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	close_time TIMESTAMPTZ
);

CREATE TABLE lists (
	list_id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUID_GENERATE_V4(),
	title VARCHAR (512) NOT NULL,
	board_id UUID NOT NULL,
	archived BOOLEAN NOT NULL DEFAULT FALSE,
	previous_id UUID NULL,
	CONSTRAINT lists_board_id_fkey
		FOREIGN KEY (board_id)
		REFERENCES boards (board_id) MATCH SIMPLE
		ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT lists_previous_id_fkey
		FOREIGN KEY (previous_id)
		REFERENCES lists (list_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE cards (
	card_id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUID_GENERATE_V4(),
	title VARCHAR (512) NOT NULL,
	list_id UUID NOT NULL,
	archived BOOLEAN NOT NULL DEFAULT FALSE,
	cover_id UUID,
	description TEXT,
	previous_id UUID NULL,
	create_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	archive_time TIMESTAMPTZ,
	CONSTRAINT cards_list_id_fkey
		FOREIGN KEY (list_id)
		REFERENCES lists (list_id) MATCH SIMPLE
		ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT cards_previous_id_fkey
		FOREIGN KEY (previous_id)
		REFERENCES cards (card_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE attachments (
	attachment_id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUID_GENERATE_V4(),
	url TEXT NOT NULL,
	name TEXT,
	card_id UUID NOT NULL,
	color VARCHAR (50),
	creation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	type VARCHAR (50) NOT NULL DEFAULT 'link'::VARCHAR,
	size INTEGER,
	CONSTRAINT attachments_card_id_fkey
		FOREIGN KEY (card_id)
		REFERENCES cards (card_id) MATCH SIMPLE
		ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE checklists (
	checklist_id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUID_GENERATE_V4(),
	title VARCHAR (512) NOT NULL DEFAULT 'Checklist'::VARCHAR,
	card_id UUID NOT NULL,
	previous_id UUID NULL,
	CONSTRAINT checklists_card_id_fkey
		FOREIGN KEY (card_id)
		REFERENCES cards (card_id) MATCH SIMPLE
		ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT checklists_previous_id_fkey
		FOREIGN KEY (previous_id)
		REFERENCES checklists (checklist_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE checklist_items (
	item_id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUID_GENERATE_V4(),
	item_content TEXT,
	checklist_id UUID NOT NULL,
	checked BOOLEAN NOT NULL DEFAULT FALSE,
	previous_id UUID NULL,
	CONSTRAINT items_checklist_id_fkey
		FOREIGN KEY (checklist_id)
		REFERENCES checklists (checklist_id) MATCH SIMPLE
		ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT items_previous_id_fkey
		FOREIGN KEY (previous_id)
		REFERENCES checklist_items (item_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);
