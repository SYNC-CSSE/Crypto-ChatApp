--
-- PostgreSQL database dump
--

\restrict pax7jqhVVj8Ok9CgmRb7uf9dUcCyrAeZ0SGuxMJm3iBZcr1dfWFOkFQKFAxBRmU

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_members (
    id uuid NOT NULL,
    chat_id uuid,
    user_id uuid,
    role character varying(10) DEFAULT 'MEMBER'::character varying,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chat_members OWNER TO postgres;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id uuid NOT NULL,
    type character varying(10) NOT NULL,
    name character varying(255),
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chats_type_check CHECK (((type)::text = ANY (ARRAY[('PRIVATE'::character varying)::text, ('GROUP'::character varying)::text])))
);


ALTER TABLE public.chats OWNER TO postgres;

--
-- Name: message_bundles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_bundles (
    id bigint NOT NULL,
    ipfs_cid character varying(255),
    transaction_hash character varying(255),
    bundle_hash character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.message_bundles OWNER TO postgres;

--
-- Name: message_bundles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.message_bundles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.message_bundles_id_seq OWNER TO postgres;

--
-- Name: message_bundles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.message_bundles_id_seq OWNED BY public.message_bundles.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    chat_id uuid,
    sender_id uuid,
    content character varying(255) NOT NULL,
    iv character varying(255),
    type character varying(255) DEFAULT 'TEXT'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    message_hash character varying(255),
    bundle_id bigint
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: message_bundles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_bundles ALTER COLUMN id SET DEFAULT nextval('public.message_bundles_id_seq'::regclass);


--
-- Data for Name: chat_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_members (id, chat_id, user_id, role, joined_at) FROM stdin;
d13b7480-c4db-49e8-aff2-679200be4217	3970166c-d31a-42d6-966e-ed71d1d16f0b	e8d7b0fe-73f7-4cc2-896d-6cf065aa7ae6	ADMIN	2026-03-26 21:42:15.074524
5085879e-c92d-436f-b2eb-5f29a8274e54	3970166c-d31a-42d6-966e-ed71d1d16f0b	24fdcab5-8ee6-489f-bc1b-eb31547c7e0a	MEMBER	2026-03-26 21:42:15.074524
d2c359dc-f2c0-4409-833a-d8d069560ba2	949ad807-7c5c-4897-96e9-589612d3f560	e8d7b0fe-73f7-4cc2-896d-6cf065aa7ae6	ADMIN	2026-03-26 21:42:15.074524
bcb111c0-3221-4fcc-9d59-730c622bc744	949ad807-7c5c-4897-96e9-589612d3f560	85617e38-0791-464a-bb34-bb628c4c826a	MEMBER	2026-03-26 21:42:15.074524
c6ab8979-abb5-45d2-9618-345c2717b773	850838d1-f958-48ca-a2c6-9ade90a86817	24fdcab5-8ee6-489f-bc1b-eb31547c7e0a	ADMIN	2026-03-26 21:42:15.074524
e09da97c-8608-4457-8c9e-26c06caacacf	850838d1-f958-48ca-a2c6-9ade90a86817	e8d7b0fe-73f7-4cc2-896d-6cf065aa7ae6	MEMBER	2026-03-26 21:42:15.074524
79e6adc1-080d-4f3f-a910-c18b98eb3483	850838d1-f958-48ca-a2c6-9ade90a86817	12a6eeb7-883c-494f-b0c3-5d7e5e52fd8a	MEMBER	2026-03-26 21:42:15.074524
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chats (id, type, name, created_by, created_at) FROM stdin;
3970166c-d31a-42d6-966e-ed71d1d16f0b	PRIVATE	\N	e8d7b0fe-73f7-4cc2-896d-6cf065aa7ae6	2026-03-26 21:18:31.056193
949ad807-7c5c-4897-96e9-589612d3f560	PRIVATE	\N	e8d7b0fe-73f7-4cc2-896d-6cf065aa7ae6	2026-03-26 21:18:42.738252
850838d1-f958-48ca-a2c6-9ade90a86817	GROUP	Test Group	24fdcab5-8ee6-489f-bc1b-eb31547c7e0a	2026-03-26 21:42:15.074524
\.


--
-- Data for Name: message_bundles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message_bundles (id, ipfs_cid, transaction_hash, bundle_hash, created_at) FROM stdin;
1	QmeX8xptpA8UhDkM2zgpuYkeWXyD2kiGAJNT5DtBw75jAr	0xe835b10277cde591b7a6cd6d3e3b364b9afab986002ac6ad568300dbda0aec7f	16586e721a5530c3ea1a86e340b23db3cac99811cc0f1344530a887250ee459c	2026-03-28 23:48:43.545379
2	QmZCjqY63LYGjadL1ufAZbT7P8XFEWrxPy98tbzzPzDMPt	0x262e3f6ca70f2ee5eae2489136985e6f9083c1e06e84fa555a6b838ec4d98dfa	2940169066ff68453726203d867e29fab78a40494933021d28e45999de3c11db	2026-03-28 23:49:42.318882
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, chat_id, sender_id, content, iv, type, created_at, status, message_hash, bundle_id) FROM stdin;
8fe39dbb-788e-41ac-bc7c-a9e8e68ece96	850838d1-f958-48ca-a2c6-9ade90a86817	24fdcab5-8ee6-489f-bc1b-eb31547c7e0a	Hallo	123	TEXT	2026-03-27 01:38:59.654983	VERIFIED	\N	1
c7c65f0a-3a27-4ad5-af30-8f1907a47348	3970166c-d31a-42d6-966e-ed71d1d16f0b	24fdcab5-8ee6-489f-bc1b-eb31547c7e0a	Hallo2	123	TEXT	2026-03-28 21:57:25.014207	VERIFIED	ce38e1efb2505af8ed20924b39188c4dcf6a4f6fa17a3fb67ef61ff0de2863e7	1
d3a75334-b0e2-4a67-9e67-d3890c8ba367	3970166c-d31a-42d6-966e-ed71d1d16f0b	24fdcab5-8ee6-489f-bc1b-eb31547c7e0a	Hallo3	123	TEXT	2026-03-28 23:49:38.546695	VERIFIED	fb91b61a2bd49c7d9705566d43bc32f94c3802ccce9721a948be9a7932978b97	2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, created_at) FROM stdin;
e8d7b0fe-73f7-4cc2-896d-6cf065aa7ae6	alpha	alpha@gmail.com	$2a$10$jrtRTOBdVSLq683lK.z1WeFq8X3UgN2Ouel5RpA.IFOvo12DtE8Sa	2026-03-26 21:16:09.701399
24fdcab5-8ee6-489f-bc1b-eb31547c7e0a	beta	beta@gmail.com	$2a$10$4if7mJCwXCjeuKQ6CPGHFO60rsuRuLBVJUTRmNDn7YLfaGZrfEG6K	2026-03-26 21:16:19.086068
85617e38-0791-464a-bb34-bb628c4c826a	charlie	charlie@gmail.com	$2a$10$83jRHk0tBf121nUv34/rWePFODWt9B0qMONJTiz5cmhPRVlUmoABe	2026-03-26 21:16:29.335185
12a6eeb7-883c-494f-b0c3-5d7e5e52fd8a	delta	delta@gmail.com	$2a$10$cAeiKRsK.k.wHDqFFpIV.ufKlKaJJmq0I22BheAbqh0jwrq2ufezu	2026-03-26 21:20:35.684719
\.


--
-- Name: message_bundles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_bundles_id_seq', 2, true);


--
-- Name: chat_members chat_members_chat_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_chat_id_user_id_key UNIQUE (chat_id, user_id);


--
-- Name: chat_members chat_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: message_bundles message_bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_bundles
    ADD CONSTRAINT message_bundles_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_messages_status_pending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_status_pending ON public.messages USING btree (status) WHERE ((status)::text = 'PENDING'::text);


--
-- Name: chat_members chat_members_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_members chat_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chats chats_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: messages fk_message_bundle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_message_bundle FOREIGN KEY (bundle_id) REFERENCES public.message_bundles(id) ON DELETE SET NULL;


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict pax7jqhVVj8Ok9CgmRb7uf9dUcCyrAeZ0SGuxMJm3iBZcr1dfWFOkFQKFAxBRmU

