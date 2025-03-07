---
title: '4-Day AO Smart Contract Challenge'
status: 'published'
author:
  name: 'Community Labs Team'
  avatar: 'https://pbs.twimg.com/profile_images/1763452926851239936/vZHMjCrW_400x400.jpg'
  twitter: 'https://twitter.com/communitylabs'
slug: '4-day-ao-smart-contract-challenge'
category: 'ANNOUNCEMENT'
description: "Immerse yourself in this four-day challenge that will guide you through building smart contracts on AO, using the Lua programming language."
coverImage: '/blog/images/4-day-ao-smart-contract-challenge.png'
transparentThumbnail: 'https://u2hyhgglc4egidq3zkthnzdruyatqwql5lk5foen3zv5zf5fo2wa.arweave.net/po-DmMsXCGQOG8qmduRxpgE4Wgvq1dK4jd5r3Jeldqw'
themeColor: 'rgba(0, 0, 0, .15)'
publishedAt: '2025-03-07'
---

This four-day challenge will guide you through building smart contracts on **AO**, using the Lua programming language. Each day introduces new concepts with progressive difficulty, culminating in a capstone mini-project on Day 4\. By the end, you will have built a functional token contract on AO. Each day is broken into missions (presented as `.lua` files with commented instructions). Some code sections are left blank or marked as TODO for you to fill in, so you can code along and practice. That’s it! As long as you’re building on Protocol Land, you’re eligible to win $ in our challenge.Good luck\!

**Day 1: Lua Basics**

* Learn fundamentals of Lua: variables, functions, control structures, loops, tables, and error handling.  
* Complete small script-based missions that ensure you’re comfortable coding in Lua before diving into AO.

**Day 2: Introduction to AO Smart Contracts**

* Understand AO environment setup and how contracts (a.k.a. Processes) respond to messages.  
* Build a simple “ping-pong” contract that demonstrates event handling, message replies, and maintaining contract state.

**Day 3: Advanced AO Smart Contracts**

* Deepen your knowledge with topics like state management, inter‐contract communication, and security best practices.  
* Implement ownership checks, restricted actions, and safe input validation to protect your contracts from unauthorized use.

**Day 4: Capstone Project—Token Contract**

* Combine everything you’ve learned to create a working token contract with balances, transfers, and minting.  
* Learn how to query contract info and handle transactions securely. This final mini‐project showcases how AO can manage tokens.

## **Day 1: Lua Basics for AO Contracts**

**Goal:** Learn the fundamentals of Lua (the language used for AO smart contracts) – variables, control structures, loops, functions, tables, and error handling. These basics will prepare you to write AO contracts. Lua is a simple, beginner-friendly language (if you know JavaScript, Lua will feel like a cleaner, simplified version ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=Lua%20is%20a%20simple%20language,Clean%20computation%20with%20sane%20syntax))). We will practice Lua syntax through short missions.

### **Mission 1: Variables and Basic Syntax (`day1_mission1.lua`)**

```
-- Title: Lua Variables and Basic Syntax
-- Description: Learn how to create and use variables, and perform simple operations.

-- 1. Defining a variable and doing arithmetic:
local a = 10          -- define a variable 'a' with value 10 (local means it's limited to this file or function)
local b = 5 + 3       -- you can do basic math (+, -, *, /, %) as expected; here b will be 8 ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=,that%20Lua%20uses%20for%20modulus))
-- TIP: Lua uses `--` for comments, and variables are dynamically typed.

-- 2. Using variables:
local c = a * 2       -- c will be 20 since a is 10 ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=,Handlers))
-- By convention, global variables in AO (accessible across handlers) start with a capital letter ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=,Handlers)), 
-- while local variables (scoped) are lowercase. (This is a convention, not enforced by Lua.)

-- 3. Strings and concatenation:
local name = "AO"
local greeting = "Hello, " .. name    -- use .. to concatenate strings ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=,..%20ao.id))
-- (In Lua, .. joins strings. greeting now is "Hello, AO")

-- 4. Outputting values:
-- In the AO console, simply writing an expression will output it. E.g., typing `a` would show its value ([Introduction | Cookbook](https://cookbook_ao.g8way.io/guides/aos/intro.html#:~:text=If%20you%20want%20to%20display,simply%20type%20the%20variable%20name)).
-- For now, we'll simulate output by returning a value (since this is a script file).
return greeting  -- this will return "Hello, AO" when run (in a script, `return` sends result to output)
```

### **Mission 2: Conditional Logic (`day1_mission2.lua`)**

```
-- Title: Lua Conditional Logic
-- Description: Practice if-else statements for decision making.

local x = 7

-- 1. Basic if-else:
if x > 5 then
    -- this block executes if condition is true
    result = "x is greater than 5"
else
    -- this block executes if condition is false
    result = "x is not greater than 5"
end

-- 2. Else-if (elseif in Lua) for multiple conditions:
local y = 0
if y < 0 then
    result2 = "y is negative"
elseif y == 0 then
    result2 = "y is zero"
else
    result2 = "y is positive"
end

-- Note: Lua uses `==` for equality and `~=` for "not equal" (not `!=`) ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=,than%20their%20more%20common%20names)).
-- Indentation isn't required by Lua, but it improves readability.
-- We'll return the results as a table to see both outcomes:
return {result, result2}
```

*(The code above uses two examples: one if/else and one if/elseif/else. In Lua, any number other than 0 is truthy, and you can chain conditions with `elseif` as shown ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=Experimenting%20with%20conditional%20statements)).)*

### **Mission 3: Loops (`day1_mission3.lua`)**

```
-- Title: Lua Loops
-- Description: Learn to repeat actions using while and for loops.

-- 1. While loop example: increment a counter
local n = 0
while n < 5 do                    -- while condition is true, do the loop body
    n = n + 1                     -- increment n by 1
end
-- After this loop, n should be 5 (loop ran 5 times).

-- 2. Numeric for loop example: summing numbers 1 through 5
local sum = 0
for i = 1, 5 do                   -- for i from 1 to 5 (inclusive)
    sum = sum + i
end
-- After this loop, sum = 15 (1+2+3+4+5).

-- 3. Generic for (pairs) loop example: iterating a table's key-value pairs
local tbl = {foo = "bar", baz = "qux"}
local concatenated = ""
for key, value in pairs(tbl) do   -- iterate through all key-value pairs in tbl
    concatenated = concatenated .. key .. ":" .. value .. " "
end
-- After loop, concatenated might be "foo:bar baz:qux " (order not guaranteed in a table).

return {n = n, sum = sum, concatenated = concatenated}
```

*(Lua provides `while` loops and two kinds of `for` loops. The numeric `for` loop (`for i = start, end, [step] do ... end`) is useful for sequences of numbers. The generic `for` loop with `pairs()` or `ipairs()` iterates over table elements. Lua tables are not ordered, so iteration order for non-array tables is undefined. In the example above, `pairs(tbl)` goes through each key in any order.)*

### **Mission 4: Functions and Error Handling (`day1_mission4.lua`)**

```
-- Title: Lua Functions and Error Handling
-- Description: Learn to write reusable functions and handle errors gracefully.

-- 1. Defining a function:
function greet(person)
    return "Hello, " .. person    -- returns a greeting string
end
-- Alternatively, Lua allows anonymous functions assigned to variables:
adder = function(a, b) return a + b end
-- (The above is equivalent to defining a function named 'adder'.) ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=function%20greeting%28name%29%20return%20,name%20end))

-- 2. Calling functions:
local message = greet("world")    -- message = "Hello, world"
local sum = adder(2, 3)           -- sum = 5

-- 3. Error handling basics:
function safe_divide(a, b)
    assert(b ~= 0, "Division by zero!")   -- assert throws an error if condition is false
    return a / b
end

-- Using pcall to call a function safely (pcall = protected call):
local status, result = pcall(safe_divide, 10, 0)
-- pcall returns false and an error message if an error occurred ([Programming in Lua : 8.4](https://www.lua.org/pil/8.4.html#:~:text=If%20you%20need%20to%20handle,to%20encapsulate%20your%20code)) ([Programming in Lua : 8.4](https://www.lua.org/pil/8.4.html#:~:text=The%20,false%2C%20plus%20the%20error%20message)).
-- Here, safe_divide(10,0) would trigger the assert error "Division by zero!".
-- 'status' will be false, and 'result' will contain the error message.

-- 4. Handling the error result:
if not status then
    print("Error caught: " .. result)   -- In an AO contract, you might handle or log the error differently.
end

-- Try changing the second argument to a non-zero to see a successful division:
local ok, result2 = pcall(safe_divide, 10, 2)  -- should succeed, result2 = 5
return {status, result, ok, result2}
```

*Notes:* In Lua, functions are first-class values – you can assign them to variables or pass them around. The `assert(condition, message)` function will raise an error with the given message if the condition is false. We use `pcall(func, args...)` to capture errors instead of crashing; `pcall` returns a boolean (success status) and either the function's return or an error message ([Programming in Lua : 8.4](https://www.lua.org/pil/8.4.html#:~:text=If%20you%20need%20to%20handle,to%20encapsulate%20your%20code)). In an AO smart contract, unhandled errors will stop that message's execution, so it’s good practice to validate inputs (using `assert` or conditionals) and handle errors where appropriate.

### **Mission 5: Tables (Arrays/Dictionaries) (`day1_mission5.lua`)**

```
-- Title: Lua Tables (Data Structures)
-- Description: Learn about Lua's single data structure (tables) for lists and key-value maps.

-- 1. Creating a table like an array:
local fruits = {"apple", "banana", "cherry"}   -- list of fruits
-- Lua tables can act like arrays. IMPORTANT: Lua indexing starts at 1 (not 0)! ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=,a%20new%20named%20key%20to))

-- Accessing elements:
local firstFruit = fruits[1]    -- "apple"
local count = #fruits           -- # gives the length of an array table; here 3 ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=return%20,a%20new%20named%20key%20to))

-- 2. Tables as dictionaries (key-value pairs):
local person = { name = "Alice", age = 30 }
-- Keys can be strings (as above) or other types. We can add new keys:
person.location = "Earth"       -- using dot syntax to add a new field (equivalent to person["location"] = "Earth")

-- 3. Nested tables:
person.favoriteColors = {"red", "green", "blue"}
-- We now have person.favoriteColors as a table of strings.

-- 4. Iterating an array table:
for i = 1, #fruits do
    print(fruits[i])           -- This will print each fruit. In AO, you might use ao.Dump to print tables nicely.
end

-- 5. Iterating a key-value table:
for key, value in pairs(person) do
    print(key, value)          -- prints each key and its value in person (order not guaranteed)
end

-- Returning a table:
return person
```

*Summary:* Tables are **the** data structure in Lua – they function as **arrays** (numerical indices) and **maps** (keys to values) ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=Tables%20are%20Lua%27s%20only%20compound,be%20used%20like%20traditional%20arrays)). Remember that array indices start at 1 in Lua (so `fruits[1]` is the first element) and use `~=` for not-equal comparisons as noted. You can use `pairs()` to iterate all key-value pairs in a table, or `ipairs()` to iterate array indices in order. Tables are used heavily in AO smart contracts to store state and structured data.

---

After Day 1, you should be comfortable with core Lua syntax: creating variables, making decisions with if/else, using loops for repetition, organizing code into functions, and managing data with tables. You also got a glimpse of error handling which will be useful when writing robust contracts. **Next, we'll apply these Lua skills to the AO platform.**

## **Day 2: Introduction to AO Smart Contracts**

**Goal:** Understand how to write a basic smart contract (called a **Process**) on AO. You'll learn about the basic contract structure, how contracts handle **messages** (event handling), storing/retrieving contract state, and using functions in a contract context. AO contracts run inside the **AO decentralized computer**, and you interact with them by sending messages. The code you write persists on the Arweave network as part of your process's state, making it resilient and permanent ([Get started in 5 minutes | Cookbook](https://cookbook_ao.g8way.io/welcome/getting-started.html#:~:text=Sent%20it%20a%20message%20to,network%20to%20calculate%20its%20result)).

On AO, your code runs in an interactive shell called **AOS** (AO Shell). Smart contracts respond to incoming **Messages** (which have tags and data) via **handlers**. A handler is a function that executes when a message matching certain criteria arrives ([Handlers (Version 0.0.5) | Cookbook](https://cookbook_ao.g8way.io/references/handlers.html#:~:text=The%20Handlers%20library%20provides%20a,based%20on%20varying%20input%20criteria)). We will create a simple contract that replies to messages – a "ping-pong" contract. This contract will demonstrate event handling (receiving a "ping" triggers a "pong" response).

### **Mission 1: Setting Up the AO Environment (`day2_mission1.lua`)**

```
-- Title: AO Environment Setup
-- Description: Start the AOS process and get ready to write your first contract.

-- Step 1: Launch AOS.
-- Open your terminal and run the command: aos
-- This starts your personal AO process (ensure you have AO installed as per docs).

-- Step 2: After a moment, you should see the AOS welcome ASCII art and a prompt.
-- The prompt might look like:  default@aos-0.2.2[Inbox:0]> 
-- This is an interactive Lua shell connected to the AO network ([Get started in 5 minutes | Cookbook](https://cookbook_ao.g8way.io/welcome/getting-started.html#:~:text=Welcome%20to%20your%20new%20home,the%20rest%20of%20this%20tutorial)).

-- Step 3: Open the editor to write a contract.
-- At the AOS prompt, type: .editor  and press Enter.
-- This opens an inline text editor where you can write multi-line Lua code for your contract.
```

*(The AOS CLI `.editor` command lets you write a Lua script directly into your AO process. When you type `.done`, the script will execute in your process. Now you're ready to code your contract.)*

### **Mission 2: Your First Message Handler – Ping \-\> Pong (`day2_mission2.lua`)**

```
-- Title: Ping-Pong Message Handler
-- Description: Create a handler that listens for "ping" messages and replies with "pong".

-- We'll use the Handlers library to add an event handler.
Handlers.add(
    "pingpong",                            -- 1. Handler name (identifier)
    Handlers.utils.hasMatchingData("ping"),-- 2. Pattern: checks if incoming message Data == "ping" ([Creating a Pingpong Process in aos | Cookbook](https://cookbook_ao.g8way.io/guides/aos/pingpong.html#:~:text=1,pong))
    Handlers.utils.reply("pong")           -- 3. Handler function: automatically reply "pong" to sender ([Creating a Pingpong Process in aos | Cookbook](https://cookbook_ao.g8way.io/guides/aos/pingpong.html#:~:text=1,pong))
)
-- This single line sets up a basic "ping-pong" behavior:
-- - If a message with data "ping" arrives ([Creating a Pingpong Process in aos | Cookbook](https://cookbook_ao.g8way.io/guides/aos/pingpong.html#:~:text=1,pong)),
-- - The contract responds by sending "pong" back to the message sender.

-- Save this file (if editing externally) or, if in .editor, type .done to execute it.
```

After adding the above handler, **test it** by sending a message to your process:

* At the AOS prompt, run:

```
Send({ Target = ao.id, Data = "ping" })
```

* This sends a message with Data "ping" to your own process (ao.id is the current process’s ID). The contract should catch this message and reply with "pong" ([Creating a Pingpong Process in aos | Cookbook](https://cookbook_ao.g8way.io/guides/aos/pingpong.html#:~:text=Send%28,)).  
* Check your `Inbox` for the response. You can peek at the latest message data with:

```
Inbox[#Inbox].Data   -- should be "pong" if the handler worked ([Creating a Pingpong Process in aos | Cookbook](https://cookbook_ao.g8way.io/guides/aos/pingpong.html#:~:text=Step%206%3A%20Monitor%20the%20Inbox)).
```

You’ve just deployed a simple AO smart contract\! 🎉 Whenever it receives "ping", it sends back "pong". (Any other message will be ignored, since no other handlers are defined, as expected ([Creating a Pingpong Process in aos | Cookbook](https://cookbook_ao.g8way.io/guides/aos/pingpong.html#:~:text=Step%207%3A%20Experiment%20and%20Observe))】.) This demonstrates basic **event handling**: the contract **reacts to an incoming event** (message) with a programmed response.

### **Mission 3: Adding State to the Contract (`day2_mission3.lua`)**

```
-- Title: Adding State (Ping Counter)
-- Description: Modify the ping-pong contract to keep track of how many pings it has seen.

-- Let's add a state variable to count pings:
if not PingCount then       -- if PingCount is not already defined (nil)
    PingCount = 0           -- initialize PingCount as a global counter
end

-- Now, update the pingpong handler to use a custom function so we can increment the counter.
Handlers.add(
    "pingpong", 
    Handlers.utils.hasMatchingData("ping"), 
    function(msg)                   -- custom handler function, gets the incoming message as 'msg'
        PingCount = PingCount + 1   -- increment the counter for each "ping" received
        ao.send({
            Target = msg.From, 
            Data   = "pong " .. PingCount  -- reply with "pong <count>"
        })
    end
)
-- We've replaced Handlers.utils.reply with our own function to include PingCount.
-- Now the reply will be "pong 1", "pong 2", etc., incrementing each time a "ping" message comes in.
```

With this change, your contract maintains **state**: the global `PingCount` persists in the process and updates on each message. The use of a global (without `local`) means the variable lives in the contract's state between message executions. Try sending multiple "ping" messages and observe the incrementing count in the responses.

### **Mission 4: Retrieving State via a Query (`day2_mission4.lua`)**

```
-- Title: State Query Handler
-- Description: Add a handler so users can query the current ping count.

-- We will handle a special message (e.g., Data = "stats") that asks for the PingCount.
Handlers.add(
    "stats_query",
    Handlers.utils.hasMatchingData("stats"),   -- trigger when message data is "stats"
    function(msg)
        ao.send({
            Target = msg.From,
            Data   = "PingCount is " .. tostring(PingCount)
        })
    end
)
-- This handler listens for "stats" requests and responds with the current PingCount value.
-- We use tostring() because PingCount is a number and Data expects a string.
```

Now your contract has two types of interactions:

* Send it a `"ping"` message \-\> it replies `"pong X"` (with X as the count).  
* Send it a `"stats"` message \-\> it replies with the current count in a friendly message.

Both `PingCount` and our handlers are part of the contract's **persistent state** on AO. The state (including global variables and handler definitions) remains as long as your process exists on the network.

### **Mission 5: Testing and Using the Contract (`day2_mission5.lua`)**

```
-- Title: Testing the Ping-Pong Contract
-- Description: Guidelines to test the contract's functionality in the AO shell.

-- 1. Ensure your contract code from Missions 2-4 is loaded in your AO process.
--    If you used .editor for each mission, it has been executed already. 
--    If you created separate files, use `.load <filename.lua>` in the AOS prompt to load them.

-- 2. Test the "ping" -> "pong" behavior:
Send({ Target = ao.id, Data = "ping" })
-- Check Inbox for response:
print(Inbox[#Inbox].Data)    -- should print "pong 1" on first ping.

-- 3. Test the counter increment:
Send({ Target = ao.id, Data = "ping" })   -- send a second ping
print(Inbox[#Inbox].Data)    -- now should be "pong 2".

-- 4. Test the "stats" query:
Send({ Target = ao.id, Data = "stats" })
print(Inbox[#Inbox].Data)    -- should report "PingCount is 2" (or current count).

-- 5. Try sending a message that doesn't match any handler:
Send({ Target = ao.id, Data = "hello" })
-- There should be no new response in Inbox, because no handler catches "hello".

-- Congrats! You've built and tested a stateful AO contract.
```

*Takeaway:* You have an interactive **smart contract** running on the AO network. It has a piece of state (`PingCount`) and two handlers for different message types. You can send it messages and it reacts accordingly. This covers basic **contract structure** (global state \+ handlers) and **event handling** (message-driven functions). In the next day, we'll expand on this by exploring interactions between contracts and some best practices (like security).

## **Day 3: Advanced AO Smart Contracts**

**Goal:** Build on the basic contract to learn more advanced concepts: managing state persistently, having contracts interact with other contracts, and implementing security best practices. By now, you have a simple contract that responds to messages. Today we'll ensure you know how to maintain state across code updates, how one process can communicate with another, and how to secure your contract (e.g., restricting certain actions to the contract owner, validating inputs, etc.).

Remember, your AO process (contract) is decentralized and **permanent** – its state lives on Arweave and can be restored at any tim ([Get started in 5 minutes | Cookbook](https://cookbook_ao.g8way.io/welcome/getting-started.html#:~:text=Sent%20it%20a%20message%20to,network%20to%20calculate%20its%20result))】. This means that if you update your contract code (by loading a new version), you should take care not to accidentally wipe or reset your stored state. Also, since AO is an open system, **anyone can send messages to your contract**, so you must code defensively.

### **Mission 1: Interacting with Other Contracts (`day3_mission1.lua`)**

```
-- Title: Interacting with Other Processes
-- Description: Learn how one AO process can send messages to another.

-- If you want to have two contracts talk to each other, you need separate processes.
-- Let's simulate this by starting a second AOS process:
--   Open a new terminal and run:  aos 
-- This gives you a new process with its own ao.id (you'll see a different prompt, e.g., Inbox:0 for the new process).

-- Note the process ID of the second process (found in the welcome text or by typing `ao.id` at its prompt).

-- From your first process, you can now send a message to the second process by using its ID:
local targetId = "<PUT_SECOND_PROCESS_ID_HERE>"
Send({ Target = targetId, Data = "ping" })
-- If the second process is running the ping-pong handler from Day 2, it should respond with "pong".
-- Check the second process's Inbox to see the "ping" and its Outbox for the "pong".

-- You have just sent a cross-process message. This is how contracts interact: by sending messages to each other's IDs.
-- In contract code, you would use ao.send({...}) similarly to send messages out.
```

*(In the above, we manually used the console `Send` to simulate one contract calling another. Within a contract's handler, you could call `ao.send({Target=<otherId>, ...})` to do the same from code. **Inter-contract communication** is fundamental for building complex systems on AO.)*

### **Mission 2: Preserving State on Code Reload (`day3_mission2.lua`)**

```
-- Title: Persistent State Management
-- Description: Ensure your contract's state variables persist when updating code.

-- When you loaded new code in Day 2 (like redefining handlers), you might have noticed we used patterns like:
if not PingCount then PingCount = 0 end   -- initialize only if not already se ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=local%20json%20%3D%20require))】

-- This is important. If you simply did `PingCount = 0`, every time you reload the contract code, you'd reset the counter to 0!
-- The `if not ... then ... end` check ensures that if the variable already exists in state, we leave it intact.

-- Task: Apply this principle to all your state variables.
-- For example, if you plan to have a table or any variable that should carry over across code reloads:
if not MyTable then MyTable = {} end
-- This way, MyTable won't be reinitialized if it already exists.

-- In summary, always guard your initial state definitions to avoid wiping persistent data on upgrades.
-- (You saw this in the token initialization code as well, where balances were only set if not presen ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=local%20json%20%3D%20require))】.)
```

*(This mission reinforces that AO processes keep their state in memory (and on-chain via logs). When updating code, previous global values remain unless you overwrite them. Use conditional initialization (`if not X then X = ... end`) to protect existing state. This technique is crucial for **state management** in long-lived contracts.)*

### **Mission 3: Owner-Only Actions (Security) (`day3_mission3.lua`)**

```
-- Title: Implementing Owner-Only Actions
-- Description: Restrict certain contract functions to the contract's owner for security.

-- AO processes have an "Owner" by default – typically the wallet that launched the process. 
-- You can get this via the global variable `Owner` in your contrac ([FAQ | Cookbook](https://cookbook_ao.g8way.io/guides/aos/faq.html#:~:text=Understanding%20Process%20Ownership))】.

-- Let's add an admin-only "reset" command to our ping counter contract, which resets PingCount to 0.
Handlers.add(
    "reset_counter",
    Handlers.utils.hasMatchingData("reset"),    -- trigger on messages with data "reset"
    function(msg)
        if msg.From == Owner then
            PingCount = 0
            ao.send({ Target = msg.From, Data = "PingCount reset to 0" })
        else
            ao.send({ Target = msg.From, Data = "Unauthorized: Only owner can reset." })
        end
    end
)
-- In the above:
-- msg.From is the sender's ID (could be a wallet address or process ID).
-- Owner is the stored owner address of this process.
-- We check if the sender is the owner; if not, we send back an error message.
```

This introduces a basic security pattern: **owner-only functions**. Many contracts need a concept of an admin or owner who can perform special operations (like pausing a contract, minting new tokens, resetting values, etc.). AO provides the `Owner` global for this purpos ([FAQ | Cookbook](https://cookbook_ao.g8way.io/guides/aos/faq.html#:~:text=Understanding%20Process%20Ownership))】. You can even change Owner or set it to `nil` to renounce ownership, but be careful with that.

### **Mission 4: Security Best Practices (Summary) (`day3_mission4.lua`)**

```
-- Title: Security Best Practices
-- Description: Important tips to secure AO smart contracts.

-- 1. Validate inputs and message data:
--    Always check that required message fields (Tags/Data) are present and of the correct format before using them.
--    E.g., use assertions or if-statements to guard against missing data:
--    assert(type(msg.Tags.Quantity) == "string", "Quantity is required!")  -- seen in token transfe ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=assert%28type%28msg,%27string%27%2C%20%27Quantity%20is%20required))】.

-- 2. Use Owner (or other auth mechanisms) for restricted actions:
--    As we implemented, check msg.From == Owner for admin command ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=Handlers,%27string%27%2C%20%27Quantity%20is%20required))】.
--    This prevents unauthorized users from performing sensitive operations.

-- 3. Principle of least privilege:
--    Only allow what is necessary in handlers. If a handler shouldn't be triggered by arbitrary users, include checks in its logic.

-- 4. Use ao.send (in contract code) vs Send:
--    In handlers, prefer ao.send because it returns the message object (helpful for logging or debugging ([FAQ | Cookbook](https://cookbook_ao.g8way.io/guides/aos/faq.html#:~:text=Send%20vs%20ao))】.
--    The `Send` function is a convenience in the CLI; `ao.send` is better in scripts.

-- 5. Test thoroughly:
--    Use various scenarios to ensure your contract handles unexpected or malicious inputs gracefully (no crashes, proper error messages).

-- Following these practices will make your contracts more robust and secure on the AO network.
```

By the end of Day 3, you have a more robust understanding of AO smart contracts. You've learned how to maintain state across code updates, how to have processes talk to each other, and how to implement access control and input validation. Your ping-pong contract is now safer (only you can reset it) and you've gained the tools to prevent common bugs and vulnerabilities.

Tomorrow, you'll apply all these skills in a capstone project: **building a token contract** from scratch.

## **Day 4: Capstone Project – Build a Token Smart Contract**

**Goal:** Develop a functional token (cryptocurrency) smart contract on AO, combining everything you've learned. This will be similar to creating an ERC-20-like token. The contract will manage a ledger of balances, allow transfers between accounts, and include an owner-only minting function. We'll break the project into missions: initializing state, implementing handlers for querying info and balances, transfers, and minting new tokens. Finally, you'll test the full contract.

*(Before you begin, ensure you're comfortable with Day 1-3 topics: Lua syntax, AO handlers, state management, and security patterns. Building a token is an advanced exercise that uses all of these.)*

### **Mission 1: Token State Initialization (`day4_mission1.lua`)**

```
-- Title: Token Contract Initialization
-- Description: Set up initial state variables for the token (name, ticker, balances, etc.).

-- 1. Basic token parameters:
if not Balances then 
    Balances = { [ao.id] = 1000000 }   -- Give the contract creator (Owner) an initial supply of 1,000,000 units.
end
if Name ~= "MyToken" then Name = "MyToken" end        -- Token name (change "MyToken" as desired)
if Ticker ~= "MTK" then Ticker = "MTK" end            -- Token symbol/ticker
if Denomination ~= 0 then Denomination = 0 end        -- Smallest unit (0 means indivisible token, or use 8 for cents etc.)

-- (The above pattern ensures we don't overwrite these if they are already set, following persistent state practice ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=local%20json%20%3D%20require))】.)

-- 2. Optionally, include a token logo or other metadata:
if not Logo then Logo = nil end  -- could store an Arweave TXID of an image, for example.

-- Now our state has:
-- Balances: a table mapping account IDs to token balances (initialized with all supply to Owner's process ID).
-- Name, Ticker, Denomination, Logo: metadata about the token.
```

**Explanation:** We initialize a global `Balances` table if it doesn’t exist, crediting the creator (your process) with the total suppl ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=local%20json%20%3D%20require))】. We also set up other global variables for Name, Ticker, etc. These act as **read-only state** for users (we'll allow users to query them via a handler). Using `if not ... then` guards ensures if we reload this contract later, we won't reset balances or change the token name inadvertently.

### **Mission 2: Info and Balance Query Handlers (`day4_mission2.lua`)**

```
-- Title: Token Info and Balance Handlers
-- Description: Handlers to retrieve token info and account balances.

-- 1. Info Handler: returns the token's basic info (Name, Ticker, etc.)
Handlers.add(
    "info",
    Handlers.utils.hasMatchingTag("Action", "Info"),   -- trigger on a message with tag Action="Info"
    function(msg)
        ao.send({
            Target = msg.From,
            Tags   = { 
               Name = Name, 
               Ticker = Ticker, 
               Denomination = tostring(Denomination), 
               Owner = Owner 
            }
        })
    end
)
-- If someone sends a message asking for Info, we respond with a message containing the token's Name, Ticker, etc ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=This%20code%20means%20that%20if,that%20sent%20us%20this%20message))】.
-- Note: We include Owner (or could omit) to identify who controls the token.

-- 2. Balance Handler: returns the balance of a requested account (or sender's if none specified)
Handlers.add(
    "balance",
    Handlers.utils.hasMatchingTag("Action", "Balance"),
    function(msg)
        local target = msg.Tags.Target or msg.From    -- if message provides a Target account, use it; otherwise use sender
        local bal = Balances[target] or 0             -- get balance (or 0 if account not in table)
        ao.send({
            Target = msg.From,
            Tags   = { Target = target, Balance = tostring(bal), Ticker = Ticker }
        })
    end
)
-- This allows a user to query an account balance. 
-- Example: Send a message with Tags: {Action="Balance", Target="<some_id>"} to get that account's balance.
-- If no Target is given, it defaults to sender's own balanc ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=,msg.From%5D%29%20end))】.

-- 3. Balances Handler (optional): returns the entire balances table (perhaps for the owner or debugging)
Handlers.add(
    "all_balances",
    Handlers.utils.hasMatchingTag("Action", "Balances"),
    function(msg)
        ao.send({
            Target = msg.From,
            Data   = require('json').encode(Balances)   -- send the whole Balances table as JSON string
        })
    end
)
-- This could be restricted or large; use with care. It's useful for an owner to see all holdings.
```

These handlers implement **read-only queries** for our token contract:

* **Info**: Anyone can ask for the token’s metadata. We reply with key info in the message tag ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=This%20code%20means%20that%20if,that%20sent%20us%20this%20message))】.  
* **Balance**: Anyone can ask for a balance. The contract looks up the requested account in the `Balances` table and replies with the amoun ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=Handlers,bal%20%3D%20%270))】.  
* **Balances**: (Optional) Dump all balances. This might only be used by the owner for transparency or debugging. We used `json.encode` to serialize the Lua table to a string for sending.

### **Mission 3: Transfer Handler (`day4_mission3.lua`)**

```
-- Title: Token Transfer Handler
-- Description: Enable transferring tokens between accounts, with proper checks.

Handlers.add(
    "transfer",
    Handlers.utils.hasMatchingTag("Action", "Transfer"),
    function(msg)
        -- Input validation:
        assert(type(msg.Tags.Recipient) == "string", "Recipient is required!")
        assert(type(msg.Tags.Quantity) == "string", "Quantity is required!")
        local qty = tonumber(msg.Tags.Quantity)
        assert(qty and qty > 0, "Quantity must be a positive number!")

        local sender = msg.From
        local recipient = msg.Tags.Recipient

        -- Initialize balances for sender/recipient if not present:
        if not Balances[sender] then Balances[sender] = 0 end
        if not Balances[recipient] then Balances[recipient] = 0 end

        -- Perform the transfer if the sender has enough balance:
        if Balances[sender] >= qty then
            Balances[sender] = Balances[sender] - qty
            Balances[recipient] = Balances[recipient] + qty

            -- Notify sender and recipient of the transfer:
            ao.send({ Target = sender,    Tags = { Action="DebitNotice",  To=recipient, Amount=tostring(qty) } })
            ao.send({ Target = recipient, Tags = { Action="CreditNotice", From=sender,  Amount=tostring(qty) } })
        else
            -- Insufficient balance, inform the sender of failure:
            ao.send({ Target = sender, Tags = { Action="Transfer-Error", Error="Insufficient Balance!" } })
        end
    end
)
```

This is the core **state-changing** handler: transferring tokens. Let's break down what it does:

* It expects a message with tags `Action="Transfer"`, `Recipient=<target_id>`, and `Quantity="<amount>"`.  
* It **validates** that `Recipient` and `Quantity` are provided and that quantity is a positive numbe ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=assert%28type%28msg,%27string%27%2C%20%27Quantity%20is%20required))】. (Never trust user input without checks\!)  
* It ensures both the sender and recipient have an entry in the `Balances` table (if an account hasn't been seen before, it's initialized to 0 balance ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=if%20not%20Balances,0%20end))】.  
* If the sender has enough balance (`Balances[sender] >= qty`), it deducts the amount and adds it to the recipien ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=if%20Balances%5Bmsg.From%5D%20,msg.Tags.Recipient%5D%20%2B%20qty))】. Then it sends out two notifications:  
  * A **DebitNotice** to the sender, confirming they sent X tokens.  
  * A **CreditNotice** to the recipient, informing them they received X tokens.  
     (These notices are optional but helpful; they use Tags to describe the event.)  
* If the sender doesn’t have enough balance, we send a `Transfer-Error` message back to them indicating "Insufficient Balance\! ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=else%20ao.send%28,end%20end))】.

This handler showcases multiple best practices:

* Input validation with `assert` (security ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=assert%28type%28msg,%27string%27%2C%20%27Quantity%20is%20required))】.  
* State updates (manipulating the `Balances` table).  
* Communicating outcome to the participants.

### **Mission 4: Mint Handler (Owner-only) (`day4_mission4.lua`)**

```
-- Title: Token Minting Handler
-- Description: Allow the contract owner to mint (create) new tokens.

Handlers.add(
    "mint",
    Handlers.utils.hasMatchingTag("Action", "Mint"),
    function(msg, env)
        assert(type(msg.Tags.Quantity) == "string", "Quantity is required!")
        local qty = tonumber(msg.Tags.Quantity)
        assert(qty and qty > 0, "Quantity must be a positive number!")

        -- Only allow the Owner (contract creator) to mint new tokens:
        if msg.From == Owner then
            -- Increase the balance of the owner by the minted amount:
            if not Balances[Owner] then Balances[Owner] = 0 end
            Balances[Owner] = Balances[Owner] + qty
        else
            -- Send an error message back if not authorized:
            ao.send({
                Target = msg.From,
                Tags   = { Action="Mint-Error", Error = "Only the Owner can mint new " .. Ticker .. " tokens!" }
            })
        end
    end
)
```

This adds a **minting capability** to the token, but restricts it to the contract owner:

* It checks for a `Quantity` tag and converts it to a number (must be positive).  
* If the message sender (`msg.From`) is the contract owner, it increases the owner's balance by that amount (creating new tokens in circulation ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=Handlers,%27string%27%2C%20%27Quantity%20is%20required))】.  
* If someone else attempts to mint, the contract sends back a `Mint-Error` message explaining that only the owner can min ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=ao.send%28,))】. This uses the security pattern we practiced on Day 3\.

With this, the owner (likely you) can issue new tokens as needed by sending an appropriate message to the contract.

### **Mission 5: Testing the Token Contract (`day4_mission5.lua`)**

```
-- Title: Testing the Token Contract
-- Description: Load the contract and perform a series of tests for each feature.

-- 1. Load the token contract code into your AO process:
--    If you wrote everything in one file (token.lua), use:  .load token.lua
--    If multiple files, load initialization and all handlers (order shouldn't matter as long as state init runs first).

-- 2. Test Info query:
Send({ Target = ao.id, Tags = { Action="Info" } })
print(Inbox[#Inbox].Tags)   
-- Expected: You'll see a table of Tags with Name, Ticker, Denomination, etc., matching your token's inf ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=Send%28,))】.

-- 3. Test Balance query (for your own account):
Send({ Target = ao.id, Tags = { Action="Balance" } })
print(Inbox[#Inbox].Tags.Balance)
-- Expected: It should show your balance (initial supply you set). For Owner, this might be "1000000".

-- 4. Test Transfer:
-- For this, you need another process ID to receive tokens. 
-- Open a second AOS process as earlier (Day 3) and note its ao.id (or use any Arweave wallet address as recipient).
local otherId = "<OTHER_PROCESS_OR_WALLET_ID>"
Send({ 
    Target = ao.id, 
    Tags = { Action="Transfer", Recipient = otherId, Quantity = "5000" } 
})
-- This sends a request to transfer 5000 tokens to 'otherId'.
-- Check the Inbox of your process (should contain a DebitNotice) and the Inbox of the other process (should contain a CreditNotice ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=if%20Balances%5Bmsg.From%5D%20,msg.Tags.Recipient%5D%20%2B%20qty)) ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=,Error%20%3D%20%27Insufficient%20Balance%21%27))】.
-- Also, query balances to verify:
Send({ Target = ao.id, Tags = { Action="Balance", Target = otherId } })
print(Inbox[#Inbox].Tags.Balance)   -- should be 5000 for the otherId now.
Send({ Target = ao.id, Tags = { Action="Balance" } })
print(Inbox[#Inbox].Tags.Balance)   -- owner's balance should have decreased by 5000.

-- 5. Test insufficient balance:
Send({ Target = ao.id, Tags = { Action="Transfer", Recipient = otherId, Quantity = "999999999" } })
-- This is likely more than you have. The contract should respond with a Transfer-Error (check your Inbox for the error message).

-- 6. Test Mint (owner only):
Send({ Target = ao.id, Tags = { Action="Mint", Quantity = "10000" } })
-- As the owner, this should succeed (your balance increases by 10000).
-- If you try the same from the other process (not owner), it should get a Mint-Error in response.

-- 7. (Optional) Test the "Balances" dump:
Send({ Target = ao.id, Tags = { Action="Balances" } })
-- Expect a JSON string of the whole Balances table in your Inbox (could be large if many accounts).

-- You've now tested the creation, transfer, and querying of a token contract on AO!
```

*Congratulations\!* You have built and tested a full-fledged token smart contract on AO. This capstone project used Lua fundamentals (variables, tables for Balances, functions for handlers), AO-specific concepts (message handlers, `ao.send`, persistent state), and security checks (owner restriction, input validation).

By completing these four days of challenges, you've gone from basic Lua scripting to deploying a complex smart contract on a decentralized network. You learned how AO processes work and how to use Lua to control them. As a next step, you can try creating more complex contracts or apps on AO – for example, a voting contract, a simple game, or integrating multiple contracts together. Keep exploring and happy coding\!

**Sources:**

1. AO Cookbook \- \*A Whistle Stop Tour of Lua ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=Before%20we%20can%20explore%20ao,companion%20for%20commanding%20aos%20processes)) ([A whistle stop tour of Lua. | Cookbook](https://cookbook_ao.g8way.io/concepts/lua.html#:~:text=Tables%20are%20Lua%27s%20only%20compound,be%20used%20like%20traditional%20arrays))】  
2. AO Cookbook \- \*Ping-Pong Process Tutorial ([Creating a Pingpong Process in aos | Cookbook](https://cookbook_ao.g8way.io/guides/aos/pingpong.html#:~:text=Handlers.add%28%20)) ([Creating a Pingpong Process in aos | Cookbook](https://cookbook_ao.g8way.io/guides/aos/pingpong.html#:~:text=Send%28,))】  
3. AO Cookbook \- \*Building a Token in AO ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=This%20code%20means%20that%20if,that%20sent%20us%20this%20message)) ([Building a Token in ao | Cookbook](https://cookbook_ao.g8way.io/guides/aos/token.html#:~:text=assert%28type%28msg,%27string%27%2C%20%27Quantity%20is%20required))】  
4. AO Cookbook \- \*FAQ and Guides ([FAQ | Cookbook](https://cookbook_ao.g8way.io/guides/aos/faq.html#:~:text=Understanding%20Process%20Ownership)) ([FAQ | Cookbook](https://cookbook_ao.g8way.io/guides/aos/faq.html#:~:text=Send%20vs%20ao))】