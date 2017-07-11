# dotdotdep
Copy dependencies from repos in the ../ folder to the current repo's node_modules. This is useful for development on dependent modules in a React Native project as `npm link` is broken in React Native

## To use

Add this line to your app's package.json devDependencies

    "dotdotdep": "git+ssh://git@github.com:Airbitz/dotdotdep.git#e4714aea53a1f9c9a81b68b956c29e24a8fc26a1",

Then add a line to your `scripts` section 

    "updot": "dotdotdep",

To update the node_modules

    npm run updot
    
Note that dotdotdep will explicitly exclude copying `node_modules` and `.git` from the source directories
