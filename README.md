
# HEROKU SUMMARY

## To Update Server Code

- Update `server.js` from `global.db_count = pgp(config.pgcn);` to `global.db_count = pgp(config.pgcn_heroku);`

- Open a terminal window in the folder where the server code lives (on KS machine RDL | rc-server-pg)

- Login to Heroku account
  
- Type
  - `git add`
  - `git commit -m <name_of-update>`
  - `git push heroku master`

You will see a whole series that show progress, hopefully ending in a successful build.


## To Update Database (restore Heroku version from a local backup)

- Backup local database from pgAdmin tool
- Copy that backup to a network resource (I use my Dropbox), and copy the link to that file (Heroku needs to be able to access the file over the web)
- Open a terminal window, navigate to  the server folder and login to Heroku account (I usually follow this on from A. above, so am already in the right place)
- Type (all one line)
  - `heroku pg:backups restore <url to backup> DATABASE_URL`
  - Where `url to backup` should be replaced by the link (as a string) to the backup you created above. 
  - Note that if you use the right-click method to get the Dropbox link you will need to remove the last ‘dl=0’ from the link string.

## To production build the app on Heroku

- Make sure that the `app.config.ts` file is referencing the Heroku server.
- Commit all changes.
- Test locally with `ng build --prod --aot` which will build a production version to your `dist` 
folder
- If all is well, then increment the `package.json` version number by running `npm version <major | minor | patch>` as appropriate
- To build for production and push to both Github & Heroku run `npm run deploy` then go and make tea.
- Remember to reset the `app.config.ts` back to your `localhost`


