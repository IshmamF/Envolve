{/* for now just have private to test middleware but add more as needed */}

export const protectedPaths = [
    "/private", 
]

{/* don't have to do the below, but would be nicer...
    
    TODO: change auth to (auth) and export authPaths 
    so in middleware we can just check if in authPaths 
*/}


// export const authPaths = ["/signup", "/signin", "/confirm"]