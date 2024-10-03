/*1.Separating Events from Effects:-
                                     1.Event handlers only re-run when you perform the same interaction again
                                     2.Effects re-synchronize if some value they read,like prop or state variable is different from what it was during the last render
                                     3. Sometimes we also want a mix of both behaviors:-an Effect that re-runs in response to some values but not others.
*/



/*2.EventHandlers:-
                    1.Event handlers run in response to specific interactions
*/
function ChatRoom({ roomId }) {
    const [message, setMessage] = useState('');
    // ...
    function handleSendClick() {                   //sendMessage(message) will only run if the user presses the button.
      sendMessage(message);
    }
    // ...
    return (
      <>
        <input value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={handleSendClick}>Send</button>
      </>
    );
  }



/*3.Effects:-
            1.Effects run whenever synchronization is needed 
            2.Even if the chat room component was the initial screen of your app, and the user has not performed any interactions at all,but still need to connect
*/
function ChatRoom({ roomId }) {
    // ...
    useEffect(() => {
      const connection = createConnection(serverUrl, roomId);
      connection.connect();
      return () => {
        connection.disconnect();
      };
    }, [roomId]);
    // ...
  }



/*4.Reactive values and reactive logic:-
                                        1.Props, state, and variables declared inside your component’s body are called reactive values
                                        2.Logic inside event handlers is not reactive. 
                                        3.Logic inside Effects is reactive.
*/
const serverUrl = 'https://localhost:1234';    //non-reactive

function ChatRoom({ roomId }) {       //reactive
  const [message, setMessage] = useState('');    //reactive

  // ...
}
                                      //4.Event handlers aren’t reactive, so sendMessage(message) will only run when the user clicks the Send button
  function handleSendClick() {
    sendMessage(message);
  }
                                      //5.Effects are reactive, so createConnection(serverUrl, roomId) and connection.connect() will run for every distinct value of roomId
                                      useEffect(() => {
                                        const connection = createConnection(serverUrl, roomId);
                                        connection.connect();
                                        return () => {
                                          connection.disconnect()
                                        };
                                      }, [roomId]);



/*5.Extracting non-reactive logic out of Effects:-
                                                  1.every reactive value read by an Effect must be declared as its dependency
*/
function ChatRoom({ roomId, theme }) {
    useEffect(() => {
      const connection = createConnection(serverUrl, roomId);
      connection.on('connected', () => {
        showNotification('Connected!', theme);
      });
      connection.connect();
      return () => {
        connection.disconnect()
      };
    }, [roomId, theme]); //All dependencies declared
    // ...
}


/*5.1.Declaring an Effect Event :-
                                   1.To extract this non-reactive logic out of Effect,Use a special Hook called useEffectEvent 
                                   2.Effect Events are not reactive and must be omitted from dependencies.
*/
import { useEffect, useEffectEvent } from 'react';
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {        //onConnected is called an Effect Event. It’s a part of your Effect logic, but it behaves a lot more like an event handler. 
    showNotification('Connected!', theme);
  });
  // ...
}
                                 //3.Now you can call the onConnected Effect Event from inside your Effect
                                 function ChatRoom({ roomId, theme }) {
                                    const onConnected = useEffectEvent(() => {
                                      showNotification('Connected!', theme);
                                    });
                                  
                                    useEffect(() => {
                                      const connection = createConnection(serverUrl, roomId);
                                      connection.on('connected', () => {
                                        onConnected();
                                      });
                                      connection.connect();
                                      return () => connection.disconnect();
                                    }, [roomId]); // ✅ All dependencies declared
                                    // ...
                                }



//5.2.Reading latest props and state with Effect Events:-  here,we  will call logVisit for every change to the url, and always read the latest numberOfItems
function Page({ url }) {
    const { items } = useContext(ShoppingCartContext);
    const numberOfItems = items.length;
  
    const onVisit = useEffectEvent(visitedUrl => {
      logVisit(visitedUrl, numberOfItems);
    });
  
    useEffect(() => {
      onVisit(url);
    }, [url]); // All dependencies declared
    // ...
  }
            
  


/*6.Limitations of Effect Events :-
                                     1.Only call them from inside Effects.
                                     2.Never pass them to other components or Hooks.
*/
function Timer() {
    const [count, setCount] = useState(0);
    useTimer(() => {
      setCount(count + 1);
    }, 1000);
    return <h1>{count}</h1>
  }
  
  function useTimer(callback, delay) {
    const onTick = useEffectEvent(() => {
      callback();
    });
  
    useEffect(() => {
      const id = setInterval(() => {
        onTick(); //Effect event called locally inside an Effect
      }, delay);
      return () => {
        clearInterval(id);
      };
    }, [delay]); // No need to specify an Effect Event as a dependency
  }