/*1.Lifecycle of Reactive Effects:-
                                    1.Effects lifecycle is different from Component's lifecycle
                                    2.Components may mount, update, or unmount. 
                                    3.An Effect can only do two things: to start synchronizing something, and later to stop synchronizing it. 
                                    4.This cycle can happen multiple times if your Effect depends on props and state that change over time
*/



/*2.Effect Lifecycle:-
                    1.Every React component goes through the same lifecycle:
                                                ->Mounting phase:-A component mounts when it’s added to the screen.
                                                ->Updating Phase:-A component updates when it receives new props or state inresponse to interactions
                                                ->Unmounting phase:-A component unmounts when it’s removed from the screen.
                    2.An Effect tells how to synchronize an external system to the current props and state..
*/
//Example:-Considering an effect connecting a component to chat server
import { useEffect } from "react"
const serverURL="https://localhost:1234"
function ChatRoom({roomId}) {
    useEffect (() => {
        const connection=createConnection(serverURL,roomId)   //Effect's body specifies how to start synchronizing
        connection.connect();
        return () => {
            connection.disconnect()          //The cleanup function returned by your Effect specifies how to stop synchronizing
        }
    },[roomId]);
    //...
}
                  //3.React would start synchronizing when your component mounts and stop synchronizing when your component unmounts.
                  //4.Sometimes, it may also be necessary to start and stop synchronizing multiple times while the component remains mounted.



//3.How React verifies that your Effect can re-synchronize
//App.js file
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';
const serverUrl = 'https://localhost:1234';      // Non-reactive value,URL for the chat server

function ChatRoom({ roomId }) {
  // useEffect to establish the connection when roomId changes
  useEffect(() => {
    // Create a new chat connection based on the current roomId
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();                  //cleanup function to stop synchronizing
  }, [roomId]); // Re-run effect when roomId changes

  return <h1>Welcome to the {roomId} room!</h1>;
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  const [show, setShow] = useState(false);
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <button onClick={() => setShow(!show)}>
        {show ? 'Close chat' : 'Open chat'}
      </button>
      {show && <hr />}
      {show && <ChatRoom roomId={roomId} />}
    </>
  );
}
//chat.js file
export function createConnection(serverUrl, roomId) {
    return {
      connect() {
        console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
      },
      disconnect() {
        console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
      }
    };
  }
  


/*4.How React knows that it needs to re-synchronize the Effect:-
                                           -> It’s because we told React that its code depends on roomId by including it in the list of dependencies
*/
function ChatRoom({ roomId }) { // The roomId prop may change over time
    useEffect(() => {
      const connection = createConnection(serverUrl, roomId); // This Effect reads roomId 
      connection.connect();
      return () => {
        connection.disconnect();  //cleanup function
      };
    }, [roomId]); // So you tell React that this Effect "depends on" roomId
    // ...
}



/*5.Each effect represents a seperate synchronization process:-
                                               ->Each Effect in your code should represent a separate and independent synchronization process.
*/
function ChatRoom({ roomId }) {
    useEffect(() => {
      logVisit(roomId);
    }, [roomId]);
  
    useEffect(() => {
      const connection = createConnection(serverUrl, roomId);
      // ...
    }, [roomId]);
  }




/*6.Reactive values:-
                      1. Props, state, and other values declared inside the component are reactive because they’re calculated during rendering.
*/
const serverUrl1= 'https://localhost:1234';   //it is non-reactive variable
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl1, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);   //reactive values should be included in dependencies
  // ...
}
                     //2.If serverUrl was a state variable, it would be reactive. Reactive values must be included in dependencies
                     function ChatRoom({ roomId }) { 
                        const [serverUrl, setServerUrl] = useState('https://localhost:1234'); //state may change over time
                      
                        useEffect(() => {
                          const connection = createConnection(serverUrl, roomId); // Your Effect reads props and state
                          connection.connect();
                          return () => {
                            connection.disconnect();
                          };
                        }, [roomId, serverUrl]); //we tell React that this Effect "depends on" on props and state
                        // ...
                      }



/*7.Effect with empty dependencies :-
                                      1.When Effect’s code does not use any reactive values, so its dependencies can be empty ([])
*/
const serverUrl2 = 'https://localhost:1234';    //non-reactive value
const roomId = 'general';    //non-reactive value

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl2, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); //all dependencies declared
  // ...
}



/*8.All variables declared in the component body are reactive:-
                                                                1.All values inside the component (including props, state, and variables in your component’s body) are reactive. 
                                                                2.Any reactive value can change on a re-render, so you need to include reactive values as Effect’s dependencies.
*/
function ChatRoom({ roomId, selectedServerUrl }) { // roomId is reactive
    const settings = useContext(SettingsContext); // settings is reactive
    const serverUrl = selectedServerUrl ?? settings.defaultServerUrl; // serverUrl is reactive
    useEffect(() => {
      const connection = createConnection(serverUrl, roomId); // Your Effect reads roomId and serverUrl
      connection.connect();
      return () => {
        connection.disconnect();
      };
    }, [roomId, serverUrl]);   //reactive values should be included in list of dependencies
    // ...
  }



/*9.React verifies that you specified every reactive value as a dependency:-
                                                                ->If your linter is configured for React, it will check that every reactive value used by your Effect is declared as its dependency
                                                                ->otherwise it throws lint error
*/
function ChatRoom({ roomId }) { // roomId is reactive
    const [serverUrl, setServerUrl] = useState('https://localhost:1234'); // serverUrl is reactive
    useEffect(() => {
      const connection = createConnection(serverUrl, roomId);
      connection.connect();
      return () => {
        connection.disconnect();
      };
    }, [serverUrl, roomId]); //all dependencies declared
    // ...
}



/*10.What to do when you don’t want to re-synchronize:-
                                                    1.You could prove to the linter that these values aren’t reactive values
*/
const serverUrl3 = 'https://localhost:1234'; // serverUrl is not reactive
const roomId3 = 'general'; // roomId is not reactive

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl3, roomId3);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); //All dependencies declared
  // ...
}
                                                  //2.You can also move them inside the Effect.

                                                  function ChatRoom() {
                                                    useEffect(() => {
                                                      const serverUrl = 'https://localhost:1234';          // serverUrl is not reactive
                                                      const roomId = 'general';                          // roomId is not reactive
                                                      const connection = createConnection(serverUrl, roomId);
                                                      connection.connect();
                                                      return () => {
                                                        connection.disconnect();
                                                      };
                                                    }, []); //all dependencies declared
                                                    // ...
                                                  }