# Localess tester environment

```bash
./tester-env deploy
./tester-env seed
./tester-env verify
./tester-env status
./tester-env logs
./tester-env reset
```

The app is at `http://localhost:18184/`; browser containers must use `http://host.docker.internal:18184/`. The Docker image is built from this checkout and defaults to `tester-env-localess:dev` (or honors `IMAGE_TAG`). `RUN_ID` scopes the Compose project and `--port` changes only the hosting port.

Log in with `alex.morgan@northstar.example` / `LocalessSeed!2026`. Seed creates the admin user and the `Northstar Product` space with 3 translations, 2 content documents, and 1 schema. The Docker build disables OAuth buttons; no translation service is configured. The browser build derives the emulator host from its page URL. For browser containers this routes Auth, Firestore, Storage, and Functions through `host.docker.internal:19099`, `:18084`, `:19199`, and `:15001`, respectively. Reset removes the project containers and `localess-data` volume, including emulator exports; it does not remove images or any unrelated containers.
