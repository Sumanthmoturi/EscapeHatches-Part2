/*1.Reusing Logic with Custom Hooks:-
                                     1.React comes with several built-in Hooks like useState, useContext, and useEffect.
                                     2.We can create your own Hooks for your application’s needs.                   
*/


//2.Custom Hooks
//App.js file
import { useOnlineStatus } from './useOnlineStatus.js';

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? '✅ Online':'❌ Disconnected'}</h1>;
}

function SaveButton() {
  const isOnline = useOnlineStatus();

  function handleSaveClick() {
    console.log('✅ Progress saved');
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? 'Save progress':'Reconnecting'}
    </button>
  );
}

export default function App() {
  return (
    <>
      <SaveButton />
      <StatusBar />
    </>
  );
}
//useOnlineStatus.js file
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}



/*3.Hooks names:-
                 1.Hooks names always starts with use
                 2.React component names must start with a capital letter
                 3.Hook names must start with use followed by a capital letter whether custom or built-in
*/



/*4.Custom Hooks let you share stateful logic, not state itself :-  
                                                                1.Example below
                                                                2.Custom Hooks let you share stateful logic but not state itself. 
                                                                3.Each call to a Hook is completely independent from every other call to the same Hook.
*/
//App.js file
import { useFormInput } from './useFormInput.js';

export default function Form() {
  const firstNameProps = useFormInput('Mary');                          //the Form component calls useFormInput two times
  const lastNameProps = useFormInput('Poppins');                        //2nd time here

  return (
    <>
      <label>
        First name:
        <input {...firstNameProps} />
      </label>
      <label>
        Last name:
        <input {...lastNameProps} />
      </label>
      <p><b>Good morning, {firstNameProps.value} {lastNameProps.value}.</b></p>
    </>
  );
}
//userFormInput.js file
import { useState } from 'react';

export function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  function handleChange(e) {
    setValue(e.target.value);
  }

  const inputProps = {
    value: value,
    onChange: handleChange
  };

  return inputProps;
}



/*5.Passing reactive values between Hooks:-
                                           1.The code inside custom Hooks will re-run during every re-render of your component.
                                           2.custom Hooks re-render together with your component, they always receive the latest props and state
*/



/*6.Passing event handlers to custom Hooks:-
                                          1.Customizing Behavior in Hooks: Instead of hardcoding behavior inside a custom Hook,you can allow the component to provide its own event handlers
*/
  export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl,
    onReceiveMessage(msg) {
      showNotification('New message: ' + msg);
    }
  });
}
                                           //2.Modifying the Hook to Accept Event Handlers: The custom Hook (useChatRoom) is modified to accept an event handler 
                                           export function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
                                            useEffect(() => {
                                              const connection = createConnection({ serverUrl, roomId });
                                              connection.connect();
                                              connection.on('message', (msg) => {
                                                onReceiveMessage(msg); // Call the event handler provided by the component
                                              });
                                              return () => connection.disconnect(); // Clean up on re-render/unmount
                                            }, [roomId, serverUrl, onReceiveMessage]); // Re-run if dependencies change
                                          }
                                          //3.Avoiding Unnecessary Re-renders
                                          import { useEffect, useEffectEvent } from 'react';

export function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
  const onMessage = useEffectEvent(onReceiveMessage); // Stable event handler

  useEffect(() => {
    const connection = createConnection({ serverUrl, roomId });
    connection.connect();
    connection.on('message', (msg) => {
      onMessage(msg); // Use the stable event handler
    });
    return () => connection.disconnect(); // Clean up
  }, [roomId, serverUrl]); // Only re-run if roomId or serverUrl changes
}
                                          


/*7.When to use custom Hooks:- 
                               1.Use custom Hooks for effects,Consider wrapping it in custom hooks
                               2.Don't extract hook for trivial/Repeated code
*/
                             //3.Example:-
//consider a ShippingForm component that displays two dropdowns: one shows the list of cities, and another shows the list of areas in the selected city.
function ShippingForm({ country }) {
    const [cities, setCities] = useState(null);
    // This Effect fetches cities for a country
    useEffect(() => {
      let ignore = false;
      fetch(`/api/cities?country=${country}`)
        .then(response => response.json())
        .then(json => {
          if (!ignore) {
            setCities(json);
          }
        });
      return () => {
        ignore = true;
      };
    }, [country]);
  
    const [city, setCity] = useState(null);
    const [areas, setAreas] = useState(null);
    // This Effect fetches areas for the selected city
    useEffect(() => {
      if (city) {
        let ignore = false;
        fetch(`/api/areas?city=${city}`)
          .then(response => response.json())
          .then(json => {
            if (!ignore) {
              setAreas(json);
            }
          });
        return () => {
          ignore = true;
        };
      }
    }, [city]);
  //...
}
//we can simplify the ShippingForm component above by extracting the common logic between them into your own useData Hook    
    function useData(url) {
        const [data, setData] = useState(null);
        useEffect(() => {
          if (url) {
            let ignore = false;
            fetch(url)
              .then(response => response.json())
              .then(json => {
                if (!ignore) {
                  setData(json);
                }
              });
            return () => {
              ignore = true;
            };
          }
        }, [url]);
        return data;
    }
//Now we can replace both Effects in the ShippingForm components with calls to useData 
       function ShippingForm({ country }) {
            const cities = useData(`/api/cities?country=${country}`);
            const [city, setCity] = useState(null);
            const areas = useData(city ? `/api/areas?city=${city}` : null);
            // ...
       }