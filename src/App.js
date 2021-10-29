import { useEffect, useState } from "react";
function App() {
  const [seats, setSeats] = useState(null);
  const [res, setRes] = useState(null);
  const [inputVal, setInputVal] = useState(0);

  // Get Seats data
  const getData = () => {
    fetch("https://seat-booking-api-web.herokuapp.com/seats")
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setRes(Object.values(data[0].rows));
      });
  };

  useEffect(() => {
    getData();
  }, []);

  // post data
  async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  const update = (inputVal, res) => {
    if (inputVal > 7) {
      return;
    }
    const emptyRows = [];
    // find the row and update the emptyRows array
    function find() {
      if (!Number.isNaN(inputVal)) {
        res.map((row) => {
          const emptySeats = row.filter((i) => (i ? null : i.toString()));
          // console.log("empty seats", emptySeats);
          emptyRows.push(emptySeats.length);
          return null;
        });
      }
      // console.log(emptyRows);

      // Find the nearest possible row
      let match = null;
      emptyRows.map((i) => {
        if (match !== null) {
          return null;
        }
        if (i >= inputVal) {
          match = emptyRows.indexOf(i);
          return "match";
        } else {
          return "not-a-match";
        }
      });
      // console.log("match found", match);
      // console.log(nearestRow);

      // Now update the data
      function updater() {
        let seats = [];
        let counter = inputVal;
        let updateVal = null;
        // console.log("updater", res);
        // console.log("updater match", res[match]);
        const updatedRow = res[match].map((i, j) => {
          if (i) {
            return i;
          } else {
            if (counter > 0) {
              seats.push(j);
              counter = counter - 1;
              // console.log("the counter is", counter);
              return true;
            } else {
              return i;
            }
          }
        });
        // console.log("updated row", updatedRow);
        updateVal = res;
        updateVal[match] = updatedRow;
        // console.log(updateVal);
        postData("https://seat-booking-api-web.herokuapp.com/update", {
          title: "Coach",
          rows: updateVal,
        }).then((data) => {
          getData();
        });

        seats = seats.map((i) => {
          return i + 1 + match * 7;
        });
        setSeats([...seats]);
      }
      updater();
    }
    find();
  };

  // Reset coach seat allotment
  const reset = () => {
    // console.log(updateVal);
    postData("https://seat-booking-api-web.herokuapp.com/reset", {
      title: "Coach",
    }).then((data) => {
      getData();
      // console.log(data);
    });
  };

  return (
    <>
      <div className="container container1">
        {res
          ? res.map((i, z) => {
              return (
                <section key={z} className="flex">
                  {i.map((j) => {
                    return (
                      <span
                        className="box"
                        style={j ? { background: "dodgerblue" } : null}
                      ></span>
                    );
                  })}
                </section>
              );
            })
          : null}
      </div>
      <div className="container container2">
        <input
          value={inputVal}
          className="input"
          onChange={(e) => {
            setInputVal(e.target.value);
          }}
        />
        <button className="btn" onClick={() => update(inputVal, res)}>
          Find Seats
        </button>
        <button className="btn danger" onClick={reset}>
          reset
        </button>
        <div className="seats flex seat-wrap">
          {seats ? seats.map((i) => <div className="box teal">{i}</div>) : null}
        </div>
      </div>
    </>
  );
}

export default App;
