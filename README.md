# Norns REPL

Interact with [Norns](https://monome.org/norns/) in a VSCode terminal

![Demo](https://github.com/midouest/norns-repl/blob/master/images/demo.gif?raw=true)

## Commands

`nornsREPL.matron.connect`

-   Connect to the Matron REPL at the configured Norns host and port
-   Command Palette: _"Norns REPL: Connect to Matron..."_

`nornsREPL.crone.connect`

-   Connect to the Crone REPL at the configured Norns host and port
-   Command Palette: _"Norns REPL: Connect to Crone..."_

## Configuration

`nornsREPL.host`

-   Norns hostname to connect to
-   Default: `norns.local`

`nornsREPL.matron.port`

-   Matron websocket port to connect to
-   Default: `5555`

`nornsREPL.crone.port`

-   Crone websocket port to connect to
-   Default: `5556`

`nornsREPL.maxHistory`

-   Maximum number of previous commands to store in history
-   Default: 100
