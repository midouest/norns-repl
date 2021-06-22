# Norns REPL

Interact with [Norns](https://monome.org/norns/) in a VSCode terminal

![Demo](https://github.com/midouest/norns-repl/blob/master/images/demo.gif?raw=true)

## Commands

`nornsREPL.matron.connect`

-   Connect to the Matron REPL at the configured Norns host and port
-   Command Palette: _"Norns REPL: Connect to Matron..."_

`nornsREPL.matron.send`

-   Send a command to the Matron REPL at the configured Norns host and port
-   Command Palette: _"Norns REPL: Send Command to Matron..."_

`nornsREPL.matron.sendSelection`

-   Send the selected Lua code to the Matron REPL at the configured Norns host and port
-   The Matron REPL must be connected and the active editor language must be Lua

`nornsREPL.crone.connect`

-   Connect to the Crone REPL at the configured Norns host and port
-   Command Palette: _"Norns REPL: Connect to Crone..."_

`nornsREPL.crone.send`

-   Send a command to the Crone REPL at the configured Norns host and port
-   Command Palette: _"Norns REPL: Send Command to Crone..."_

`nornsREPL.crone.sendSelection`

-   Send the selected Lua code to the Crone REPL at the configured Norns host and port
-   The Crone REPL must be connected and the active editor language must be Supercollider

`nornsREPL.script.reload`

-   Reload the current script using `norns.script.load(norns.state.script)`
-   Command Palette: _"Norns REPL: Reload Script"_

`nornsREPL.sleep`

-   Put Norns to sleep using `norns.shutdown()`
-   Command Palette: _"Norns REPL: Sleep"_

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
