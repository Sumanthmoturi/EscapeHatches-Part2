/*1.To remove a dependency, prove that it’s not a dependency:-
                                                            1.To remove a dependency, “prove” to the linter that it doesn’t need to be a dependency
*/
//here,roomId is a reactive value,you must specify that reactive value as dependency to your effect
const serverUrl1 = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl1, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
}
//To remove a dependency,prove to linter that it does'nt need to be a dependency
const serverUrl = 'https://localhost:1234';
const roomId = 'music'; // Not a reactive value anymore

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, []); //All dependencies declared
}



/*2.To change the dependencies, change the code :-   If you want to change the dependencies, change the surrounding code first
                                                   1.First, you change the code of your Effect or how your reactive values are declared.
                                                   2.Then, you follow the linter and adjust the dependencies to match the code you changed
                                                   3.If you’re not happy with the list of dependencies, you go back to the first step and change the code again
*/



/*3.Removing unnecessary dependencies:-
                                       1.below,Now the first Effect only re-runs if the country changes, while the second Effect re-runs when the city changes. 
                                            ->You’ve separated them by purpose where two different things are synchronized by two separate Effects. 
                                            ->Two separate Effects have two separate dependency lists, so they won’t trigger each other unintentionally.
*/
function ShippingForm({ country }) {
    const [cities, setCities] = useState(null);
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
    }, [country]); //All dependencies declared
  
    const [city, setCity] = useState(null);
    const [areas, setAreas] = useState(null);
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
    }, [city]); //All dependencies declared
  //...
}

//Here,Effect does not read the messages variable at all now. You only need to pass an updater function like msgs => [...msgs, receivedMessage],react will provide the msgs argument to it during the next render.
function ChatRoom({ roomId }) {
    const [messages, setMessages] = useState([]);
    useEffect(() => {
      const connection = createConnection();
      connection.connect();
      connection.on('message', (receivedMessage) => {
        setMessages(msgs => [...msgs, receivedMessage]);
      });
      return () => connection.disconnect();
    }, [roomId]); //All dependencies declared
    // ...
}



//Wrapping an event handler from the props:-
function ChatRoom({ roomId, onReceiveMessage }) {
    const [messages, setMessages] = useState([]);
  
    const onMessage = useEffectEvent(receivedMessage => {    // wrap the call in an Effect Event
      onReceiveMessage(receivedMessage);
    });
  
    useEffect(() => {
      const connection = createConnection();
      connection.connect();
      connection.on('message', (receivedMessage) => {
        onMessage(receivedMessage);
      });
      return () => connection.disconnect();
    }, [roomId]); //all/ dependencies declared
    // ...
}


/*4.Try to avoid object and function dependencies:-
                                                    1.Try to avoid object and function dependencies,Move them outside the component or inside the Effect
                                                    2.Object and function dependencies can make your Effect re-synchronize more often than you need.
*/

                                                   //3.Moving static objects and functions outside your component 
function createOptions() {           //moving outside component       
    return {
      serverUrl: 'https://localhost:1234',
      roomId: 'music'
    };
  }
  
  function ChatRoom() {
    const [message, setMessage] = useState('');
  
    useEffect(() => {
      const options = createOptions();
      const connection = createConnection(options);
      connection.connect();
      return () => connection.disconnect();
    }, []); //All dependencies declared
    // ...
  }


                                                   //4.Move dynamic objects and functions inside your Effect 
const serverUrl5= 'https://localhost:1234';
function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const options = {
      serverUrl: serverUrl5,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); //All dependencies declared
  // ...
}