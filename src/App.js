import "./App.css";
import axios from "axios";
import { useState, useEffect } from "react";

// const sortingParam = "sortType=ASC&sortBy=price";
const listingUrl = "https://api-apollo.pegaxy.io/v1/game-api/market/pegasListing";
const pegaUrl = "https://api-apollo.pegaxy.io/v1/game-api/pega";

const CUR_USDT_ID = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const CUR_USDT_BASE = 1000000;
const CUR_PGX_ID = "0xc1c93D475dc82Fe72DBC7074d55f5a734F8cEEAE";
const CUR_PGX_BASE = 1000000000000000000;

function App() {
  const [total, setTotal] = useState(0);
  const [pegasList, setPegasList] = useState([]);
  const [pegas, setPegas] = useState([]);
  const [fetchingPegas, setFetchingPegas] = useState(false);

  useEffect(() => {
    if (total === 0) {
      axios.get(`${listingUrl}/0`).then(({ data }) => {
        setTotal(data.total);
        setPegasList(prevPegasList => [...prevPegasList, ...data.market]);
        const pages = Math.ceil(data.total / data.limit);
        for (let page = 1; page < pages; page++) {
          axios.get(`${listingUrl}/${page}`).then(({ data: pageData }) => {
            setPegasList(prevPegasList => [...prevPegasList, ...pageData.market]);
          });
        }
      });
    }
  }, [total, setTotal, pegas, setPegas]);

  useEffect(() => {
    if (total !== 0 && pegasList.length === total && fetchingPegas === false) {
      setFetchingPegas(true);
      pegasList.forEach(pegaInList => {
        axios.get(`${pegaUrl}/${pegaInList.pega.id}`).then(({ data }) => {
          setPegas(prevPegas => [...prevPegas, {
            listing: pegaInList,
            pega: data.pega
          }]);
        });
      });
    }
  }, [pegasList, total, pegas, setPegas, fetchingPegas, setFetchingPegas]);

  return (
    <div className="App">
      <h1>Pegaxy Statistics</h1>
      <h2>Total: {total}</h2>
      <table>
        <tr>
          <th>Listing ID</th>
          <th>Name</th>
          <th>Pega ID</th>
          <th>Currency</th>
          <th>Price</th>
          <th>Speed</th>
          <th>Strength</th>
          <th>Win</th>
          <th>Lose</th>
          <th>Total Races</th>
          <th>Win Rate</th>
          <th>Lightning</th>
          <th>Wind</th>
          <th>Water</th>
          <th>Fire</th>
        </tr>
        {pegas.map(({ listing, pega }, index) => {
          const winRate = pega.win / pega.total_races * 100;
          return (
            <tr key={index}>
              <td>{listing.id}</td>
              <td>{pega.name}</td>
              <td>{pega.id}</td>
              {listing.currency === CUR_USDT_ID &&
                <>
                  <td>USDT</td>
                  <td>{listing.price / CUR_USDT_BASE}</td>
                </>
              }
              {listing.currency === CUR_PGX_ID &&
                <>
                  <td>PGX</td>
                  <td>{listing.price / CUR_PGX_BASE}</td>
                </>
              }
              <td>{pega.speed}</td>
              <td>{pega.strength}</td>
              <td>{pega.win}</td>
              <td>{pega.lose}</td>
              <td>{pega.total_races}</td>
              <td>{`${winRate.toFixed(2)}%`}</td>
              <td>{pega.lighting}</td>
              <td>{pega.wind}</td>
              <td>{pega.water}</td>
              <td>{pega.fire}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
}

export default App;
