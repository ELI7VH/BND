# Travelling Performer App

an app where a musician can enter in all their songs with all related metadata, charts, instruentation and stage plot orientation

core data models:
- songs: bpm, key, lyrics, charts, versioning for different band arrangements, lighting automation lists, streaming links
- user: non-PII profile (e.g., handle, preferences). All entities link via `userId`; default `userId`="user1" locally.
- venues / stage dimensions / management information, parking etc
- stage plot diagram tool for different band layouts from solo, duo, to full piece
- charts: (belongs to song) instrument,  section, chords, lyrics, etc.
- lighting adapter (to map to any venue's lighting configuration)
- lighting automations (generic)
- shows: setlists (ordered), stage plots, venue
- setlists: collection of songs, tagged to mood, type of event

frontend:
vite, react, react-hook-form, tanstack-query

views: (also has data model notes to be integrated)
- song creation form
- song detail review
    - edit all data
- set list creation
- song listing, with "add to set list", play songs.
- stage plot diagram tool
    - lighting automation preview
- venue registration
    - address
    - stage dimensions
        - electrical
        - lighting
        - audio configurations
    - contact information
    - hours of operation or smth
- show creation
    - special request per show / set / song
    - type of event: bar, wedding, etc.
    - arrival times
    - setup times
    - parking
    - food included, and food sensitivities
    - time
    - venue contact (if different than venue one)
    - technical information

server:
express, mongoose

database:
mongo

auth:
none for MVP; Clerk placeholders kept for later enablement.

env:
- MONGO_URL: external MongoDB connection string used by the server locally

deployable:
- will be deployed on digital ocean app platform

