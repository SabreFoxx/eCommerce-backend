// Function to shutdown db
const gracefulShutdown = (msg, callback) => {
    console.log(msg);
    // When gracefulShutdown is called, close the database connection first
    // knex does this automatically, so no need of doing it here
    // Call the callback, which is intended to kill this node process
    callback();
};

// For nodemon restarts
process.once('SIGUSR2', () => { // Listens to a SIGUSR2 event. nodemon uses SIGUSR2
    gracefulShutdown('nodemon restart', () => { // Sends a message for gracefully shuting down database, and a callback to kill the process
        process.kill(process.pid, 'SIGUSR2'); // This callback emits another SIGUSR2
    });
});

// For regular app termination
process.on('SIGINT', () => { // Listens to a SIGINT event
    gracefulShutdown('app termination', () => {
        process.exit(0); // Kill this process
    });
});

/*
Now when the application terminates, it gracefully closes the database connection
before it ends.
Similarly, when nodemon restarts the application due to changes in the
source files, the application closes the current database connection first. The nodemon
listener is using process.once as opposed to process.on, as you want to listen
for the SIGUSR2 event only once in the application, since it will be emitted twice; the
first SIGUSR2 is for our application's use, while the second is for nodemon's use.
Since nodemon listens for this same event, you don’t want to capture it each time, thus
preventing nodemon from working properly.
*/

/* Tip: To kill a process running on port 3000 in case you have an error stating that a process is using
        that port: fuser 3000/tcp to view the PID, fuser -k 3000/tcp to kill the process */


