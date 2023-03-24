// Server di test non adatto al pubblico.

var express = require("express");
var http = require("http");
var fs = require("fs");
var https = require("https");
var cors = require("cors");
var mysql = require("mysql");
var app = express();
const session = require("express-session");
var app = express();
var privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/laportautomotive.duckdns.org/privkey.pem",
  "utf8"
);
var certificate = fs.readFileSync(
  "/etc/letsencrypt/live/laportautomotive.duckdns.org/fullchain.pem",
  "utf8"
);
var credentials = { key: privateKey, cert: certificate };
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
httpServer.listen(8080);
httpsServer.listen(8445);
const path = require("path");

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "5000mb" }));
app.use(bodyParser.urlencoded({ limit: "5000mb", extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "app",
  charset: "utf8mb4",
});
var TokenGenerator = require("uuid-token-generator");
const tokgen2 = new TokenGenerator(256, TokenGenerator.BASE62);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/stato/", function (request, response) {
  con.query("SELECT * FROM `status`", function (err, risposta) {
    let statos = { stato: risposta[0].ora, color: risposta[0].color };
    console.log(statos);
    response.json(statos);
  });
});

app.post("/api/prenotazioni/", function (request, response) {
  const userId = request.body.id;
  const userToken = request.body.token;
  con.query(
    "SELECT * FROM user WHERE id = ? AND token = ?",
    [userId, userToken],
    function (err, user) {
      if (risposta.length == 0) {
        //se non esistono restituisco un errore
        response.json("logout");
      } else {
        con.query(
          "SELECT * FROM prenotazioni WHERE idprop = '" + request.body.id + "'",
          function (err, risposta) {
            console.log(risposta);
            response.json(risposta);
          }
        );
      }
    }
  );
});

app.post("/api/verifica/", function (request, response) {
  // creo un'array con i valori dei parametri per la query
  const queryValues = [request.body.id, request.body.token];

  // eseguo la query con i parametri come placeholder
  con.query(
    "SELECT * FROM user WHERE id = ? AND token = ?",
    queryValues,
    function (err, risposta) {
      if (err) {
        // in caso di errore restituisco un messaggio di errore
        console.error(err);
        response.json("errore");
      } else if (risposta.length == 0) {
        // se non esistono restituisco un errore
        response.json("logout");
      } else {
        risposta[0].password = undefined;
        response.json(risposta[0]);
      }
    }
  );
});

app.post("/api/login/", function (request, response) {
  const email = request.body.username;
  const password = request.body.password;

  con.query(
    "SELECT * FROM user WHERE email = ? AND password = ?",
    [email, password],
    function (err, risposta) {
      if (err) {
        // gestione dell'errore
        response.json("error");
      } else if (risposta.length == 0) {
        // se non esistono restituisco un errore
        response.json("error");
      } else {
        const token = tokgen2.generate() + tokgen2.generate();
        const userId = risposta[0].id;
        con.query(
          "UPDATE user SET token = ? WHERE id = ?",
          [token, userId],
          function (err, risposta2) {
            if (err) {
              // gestione dell'errore
              response.json("error");
            } else {
              const user = { token: token, id: userId };
              response.json(user);
            }
          }
        );
      }
    }
  );
});
//TO-DO : Eliminare la concatenazione dei parametri per evitare attacchi, migliorare la creazione delle immagini 
app.post("/api/registrati/", function (request, response) {
  con.query(
    "SELECT * FROM user WHERE email = '" + request.body.email + "'",
    function (err, rispostal) {
      if (rispostal.length == 0) {
        if (
          request.body.nome != undefined &&
          request.body.email != undefined &&
          request.body.password != undefined
        ) {
          let img1 =
            "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAgMDAwMDBAcFBAQEBAkGBwUHCgkLCwoJCgoMDREODAwQDAoKDhQPEBESExMTCw4UFhQSFhESExL/wAALCAH0AfQBAREA/8QAHQABAAIDAQEBAQAAAAAAAAAAAAYHAQQFAgMICf/EAEEQAQABAwIDBQQHBwEHBQAAAAABAgMEBREGITEHEkFRYRNxgZEUIjJCobHRFSMkM0NSweEWJTRTcnPxNVVik/D/2gAIAQEAAD8A/oKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdOpExPSTdiqYpjedojzl8q8zHt/zL9mn31xDXq17TaPtZ+JHvuw8xxDpcztGoYn/wBsPvb1TDvfysrHq91yGxFymqN6aqao9J3ZjnHLmz16MAAAAAAAAAAAAAAAAAztO3KN/c18zNsYNqbmZdtWKIjeZrnZEdV7UtLwZqowqbmbcp5cqe7T80T1HtU1bJmYwabOJTz22piqfxhHsrifV82qZydQyKonrTTV3Y+UNC7fuXau9Xcrqmeu8zLzNUTPP5kzHhMlNc0zvEzEx0nds2NXzsWqJx8vIt7dO7XMO3gdouu4W0Tlxeo/tu26avx23SjS+16iqaadWxKrcTO01WPrRt7pTLSeKNM1qmJwcmiap+5XPdq+TqzO0xG07yRO4AAAAAAAAAAAAAAAb7deUebWzdRx9Px67+bdt2bVEb965V3Ve6/2rTVNdrh+1Mbf17k7bx6RsgGfquZql6buoZN2/VPhXVvHy6NSOUTy6+QAAEcp83qi";
          let img2 =
            "5Vbr71uqqmqOkxO2yU6D2jappE00ZNX02xG0dy5VtVEek81m8O8YafxDa/hLncvR9q1cnaqP1dzvcp2ieU+PkyAAAAAAAAAAAAAAEztHPkivFnHmJw9RVZsTTk5sx9WiOdNHrMql1riDN1+/N3Ur03ef1afu0+6HO8d+fp6AAAAExvH+Xu1drsXKbliqbdyjpVRO0rA4U7T68fuYvEMzXb22jI25x61enqs3HyrWVapu41yi9aufZqpnlL6gAAAAAAAAAAAAATO0b+SueN+0T2FVzA0Suqbscr1+jpR6QrK5XVcrmu5XVXVXO81VTvM+95iNugAAAAB0+KR8JcYZXDV+mJm5ewq5j2ln+2POPVc2latjazh0ZGDciuiuOnjTPlLcAAAAAAAAAAAAAZVh2gcd+0qr0vSK4mnba/fpnfePKJVzVzn08ObAAAAAADs8McT5PDObF3F3mzP8214VQu/R9Wx9ZwbeVg3KarV2N9t95pnxiW7E79AAAAAAAAAAAAAmUG7ReMKtIsVYGm1/xd2P3lUf06f1VJvE1TMzMzPmwAAAAAAExv0nZJeCeLa+Gs+Kb0zXg3piLlHXbymPnK7Me9RkWKbtmqKrdyN6Ko+9D6RzgAAAAAAAAAAABx+KNeo4e0u9lXOdyKe7Zo3+3VKiM7Ku5+Vev5Nc13LtU1VVTPjL4gAAAAAAHx2WT2YcVTP+6M6uau7E1Y9U1dPRZkRtG3kAAAAAAAAAAABMxHXwjdS3aJxFXrOtTZtVfw2H9Wjbxq8Z/JEwAAAAAAAfbDybmHlWb+NVNNyzXFUTC/OG9ata7o2Pl25jeqmIuR/bV4w6YAAAAAAAAAAAj/HGu/sHQL963O167Hs7Ues/6bqLme9zme9PjPmwAAAAAAAAnnZVrv0PU7uBkVbWsuneiJ6RV/qtkAAAAAAAAAABiudqZ9eqpO1PVvpWsWsKiqJow6dqoj+6rbf8oQev7TAAAAAAAAD7YWXcwcq1kWJ7";
          let img3 =
            "tyxXFdPrs/Q2nZtGo4GPk2piaL9uK4mJ5Rv4NkAAAAAAAAAAHzyLsWLNdyrpbiap90Pzzq2bVqOpZOVXMzN69XVEz5b8vwaszuwAAAAAAAAzvzhcXZdqU5mgVWK53qxLs0xv5TCZAAAAAAAAAAA4XHOb9A4WzrkTtVXR3KZ38Z/8KHj7MT5zvt5AAAAAAAAAJ92SZvstYyseqeV+1vHPxha4AAAAAAAAAAbxHXog/a1lez4etWN+d3Jpn37RP6qhiNmQAAAAAAAASPs9vzY4uwOe03a5t8/VeW/Pb8QAAAAAAAAAAnnE7q37Ya/3Om0eMVVTPryVkAAAAAAAAA6fDFybXEWm1xMxNOTRz+L9BdOXpAAAAAAAAAAAVc4nZWHa/E+00+fDapXIAAAAAAAADe0L/wBawf8Av0fm/Qsfd93+HoAAAAAAAAAAmdon3K27YKN7OnVx071UfhCswAAAAAAAAHT4atTd4g06mNvrZNEfi/QNP+IZAAAAAAAAAAJQXtZxfbaBYvxy9lfiJ5ecT+ipAAAAAAAAAEi4CxvpXFenxtytXIr+XNeURsyAAAAAAAAAATG8I/x5gzm8K5tFMbzbpi5Eesf+VFbbdes8wAAAAAAAAE67JcKb2uXsiY+rjWpjf1mFtgAAAAAAAAAA+eTYjJx7lmuImm7TNExPryfnbUcWcHOyMevrau1U/DeY/wANcAAAAAAAAFvdlGm/RtDu5VW0TmXe9E+kRtt84TcAAAAAAAAAACfLrE8p9yn+1TSZwtcpy6Ke7bzqZq5f3Rtv+cIUAAAAAAAAPpjY9zKv0WseJquXJ2op261P0NpOBRpWn2MW1H1bFEUe/wBW2AAAAAAAAAAAjPaFoX7b0C57KjvX8WJu2/h1hSM7+MdGAAAAAAAAE17L9CjUdZnMvUzNnDjenlymvyXAAAAAAAAAAAAPNznTtMbxPVSPHnDtWha5dm3Ttj5P7y3MRyjzj/8AeaNTyAAAAAAAB7s2";
          let img4 =
            "a8i7RasU9+5cqimmmPGZXzwloVPD2iWcaI/e1UxVeq223r8XZAAAAAAAAAAACY3cLjDh2niLSLtmIiL9uO9Zq/8AlHgo3Jx7mNeuWsmmaL1uqYqifPyfEAAAAAABmI3mee0bTzWD2XcLTfyY1bNtz7O3Mxj0zH2qvP4LSp3mmN+rIAAAAAAAAAAAM78tledpPB05NE6pp1NM3KP+JoiOtP8Ad+qrAAAAAAAHc4S4Zu8TalFmJ7mNbmKsi5PSmOfL3ztK88LEtYOLasY1EW7dqnu007dI9X2AAAAAAAAAAAABUvH3A06fcualpNur6LVzu24jf2fr7kEAAAAAAN3S4f0HJ4iz6cbCpq2/qVx0oheWg6Fj8P6fRi4fOKY+vVMc6pdEAAAAAAAAAAAAB4uWou01U1001UV/aiqN4lV3G/Z3Xhzcz9Eo71mqd7tmOc0+seiv4jf0nptPVj3xtsAAAAAb89o5z5Q7PDnDGZxHl028Wn91Ex7S7PKKY8Vz8P8ADuLw5h02MGiN9vr3JjnVLqgAAAAAAAAAAAAATG+3ohXF/Z1j6xNWVpMU42XO81UU0/VuT8+U+qqtS0vK0rImzqFmuzXT5xy+fi1JjadpAAAAGaaJqnamJmZ5RFMbzKa8K9m2RqvcyNYivFxJ500bfWufotfC0/G07HosYNqmzbo6U0xDYAAAAAAAAAAAAAAD4y0NW0bE1mzNrUbNN2iY+MesSrTX+yzKxJru6FX9Ksxz9nM7V0x8eqE5GLexLk28m1Xarp696NpfIAAA90bz5O/onA+q67NNVnHqs2J23u3eUbe5Z3DXAOn6DTTcrp+k5X/Mr6R7oSjbw3nbyAAAAAAAAAAAAAAADaJNue7R1HQ8DVrc0ahiWr0TG280R3o90obqvZHi3qqq9Hyqsffn3LsTVEfGOiJ6h2b63gTVNvGpyqI+9aq6/BH8nT8jBmYzbN2zt4V0bNbeJ6dAHq1RVdrii3TNVU9NomXXwuDt";
          let img5 =
            "Y1Cf4bCvRE9Kq47sT7t0o0vsjybs01armWrNO/Om1Hen59Ex0bgTR9ImK7eNTeux0rvfXn4eSRxEU07UxER5QAAAAAAAAAAAAAAAAADFdPepmJiJiesS59/QNNy6t8rAxrk+dduJ3atXBWi1Rz06x+Dx/sRov/t1n4xu2LfCuj2Npt6bibx4+z3lv2MW1jRtj2LdqnypjZ94jaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZ26sd7y6ec8nyv52NjT/EZGPb5b/Wu0x+ctG/xTpGP/N1DEj3XIn8t2pVx7oNEfW1G18peae0DQKp2jUrPyn9H3tcaaJena3qOP8atm9a1jAvRE2s3Eq38IvU7/LdtUXKbkRNExVTPSaZ33et/PqAAAAAAAAAAAAAAAADEzO+1OzWzdVw9Nte0z8m1Ypjr36uaKap2q6XiTNOnU15tW3KqImmn5yiuo9q+rZNUxg0Y+Jb/AOmaqvmj+ZxVq2fP8TnX6o8oq2j8HMrv3Lk/vLlde/8AdVM/m8bR5R8j3m2/U8Nton3wzTVNE70TNM+dPJtY2r5uHO+PlX6J/wC5Lu4PaRrmJVHfyacmInnF6jvTPy2SfTe123VERq2HVT512ef4JXpfGekaxtGHnWYrq+5XvTMfN2qZ33mJiY8JierO+8ctgAAAAAAAAAAAAAAOsuJr3GOmcP7xk3u/c2na1b51K81rtR1HUaaqNNo+g2p6Vda5+Pgh2XmX867NzNvXL9yZ3mquqanxmZmd5IjboAAAbbTvDO87xO87x0l3tG431bRe7FnKuXbNM/yrkzVTPu8k+0DtTwNR7trVaJwb/TeZiaKvjCa2r9vItxXYqprpr5xVE8nuPEAAAAAAAAAAAAAPHbxczV9fwtCx5vajept7RM029+dXpEKx4j7S83U5qs6T3sPGnrVE/Xq/0Q2qqbkzVXVNVUzvMz1l5226AAAAADr6FxTqHD1zvafd2o8bVc70z6bL";
          let img6 =
            "Q4Z7RMHWu5azJpw8uqPs1VfVqn0mUuirvAAAAAAAAAAAAAR8vLfxQji7tIs6PNeLo80ZOVE7VV9aLf6yqnUNSytVyZv6jfrvXJ8ap5fJrgAAAAADMTtzjeJ8NpTLhTtIy9Immxq1VWTjcoirrXRHp6LYwNTxtTxaMjCuU3bVf3qfD3+raiYmN45wAAAAAAAAAAAD5379vHt1XL9dFuiiN6qq52iIVTxr2iXNTmvC0aqqzi77V3Ynaq57vKEEqiN+Uzv1nnvvIAAAAAAAzE7Orw7xHmcO5lN7BuVdyZ/eWqp+rVHuXNw1xPi8SYUXMaYovUx+8szPOn9XZAAAAAAAAAAAfLKyrOFjV38m5Tbt243qmVOca8cXuIb1WPiz7PAomdqY63PWZRLfn8NjoAAAAAAADO+za03VcrScujJwbs27tPj4Vekrq4S4vxuJsXlMW8qj+Za/zCQAAAAAAAAAADxfvW8ezXdv1RTbt0zVVVPhCmuOeNrnEOVVj4dVVGDZq2iInb2kx973IlsAAAAAAAAA2tM1LI0rNtZWFXNF23VExtO2/pPovDhPiexxNp8XLU92/b5Xrc+E+ful2wAAAAAAAAAJmIiZnlEKo7R+M/p1z9m6ZXE49HK/XE79+fJAQAAAAAAAAA9zpaBreRoGpUZmJVP1f5lH91PjC9dF1fH1vAtZWHXRVTdjnTE7zTPjEt4AAAAAAAAAmdo3lCO0fiydIxYwcCvbMyeUzH9OjxVFvvvMzMz6/mwAAAAAAAAAB8dkm4G4pnh3UIt5FdU4OTXFN2jrt5THzXZbu03Kaa6Ku9TXG9NUdNnuJ3gAAAAAAAAHO17WLOhadezMrbu26Ziinf7dU9FC6lqV/Vc67lZdUzdu1zVPPpv4NUAAAAAAAAAAFpdmPFX0qz+y82qfa2qZqs11Vb96PL4LDjnHMAAAAAAAAJnaN/w81QdpvEc6nqcYePXH0XDnadp+1X4/4QqreZnfbf0YAAAAAAAA";
          let img7 =
            "AABs4Gbd07KtZOLV3btmrvUz5+i+9D1i3relY+ZjzvTdojenxpq8YdEAAAAAAABwuM9c/YGhXsiidr1ceztf9UqJruTcqmqqqaqpmZmfOfF5AAAAAAAAAAAFgdlWv/Rc25puRM+zvx3rMb8or/1WqAAAAAAABPSVPdqOuTqOtU4lqqJt4MVRMxPKa52735QhfTly5eQAAAAAAAAAAAPtiZVeJftX7FU03rVcTTPls/QOkajRqmn4+XZ2im/REz6VeMN4AAAAAAAnk0Nd1CjS9Kycm5O3sbc1fHw/F+fcnIry8i5evc67tU11Tv4zO75gAAAAAAAAAAALR7JdZ9rj5On3pmardUV24mekeKxAAAAAAACfVAe1vVJsaXjYVFW1zIud65z+7Tvt891UeAAAAAAAAAAAAA7nBmqzpXEuHfmdqK7kUXOe31ap5r4pq7223jG7IAAAAAAE9J2Ur2lajOfxRfopmJoxaabdO3u5/iingAAAAAAAAAAAAMxM01RNE7VRMTD9BcN58alomFkUzE9+1ETPrHKfxiXSAAAAAAB4v3PY2blc/cpmr5Q/O2o5U52dkZMzM/SLlVcb+W7WAAAAAAAAAAAAGaZ2mJW/2U5ntuH6sauZ72JdqiPSJnf801AAAAAABxOMcn6JwzqNyZiJmxVETPnPRQ9XOZmZiZmXkAAAAAAAAAAAAI5SsLshzO5qObjVTEd+13oifHaf9VpgAAAAAAh/ahkTY4Yro/51ymn4bqaAAAAAAAAAAAAAS7syyYs8V2on+rZrp/L9FzU7evJkAAAAAAQTtdqmNFxYjpN+d1SgAAAAAAAAAAAAO9wLVNPFen92dt7m34SvfbnPvAAAH//Z";
          con.query(
            "INSERT INTO `user` (`nome`, `email`, `telefono`, `foto`, `id`, `password`, `token`) VALUES ('" +
              request.body.nome +
              "', '" +
              request.body.email +
              "', '" +
              request.body.telefono +
              "', '" +
              img1 +
              img2 +
              img3 +
              img4 +
              img5 +
              img6 +
              img7 +
              "', NULL, '" +
              request.body.password +
              "', '');",
            function (err, risposta) {
              console.log(err);
              response.json("ok");
            }
          );
        } else {
          response.json("Compila tutti i campi obbligatori!");
        }
      } else {
        response.json(
          "Email già in uso! per continuare, usa un altra email oppure esegui un login."
        );
      }
    }
  );
});
app.post("/api/removepreno/", function (request, response) {
  //cerco se i dati esistono nel database
  con.query(
    "SELECT * FROM user WHERE id = ? AND token = ?",
    [request.body.id, request.body.token],
    function (err, risposta) {
      if (risposta.length == 0) {
        //se non esistono restituisco un errore
        response.json("logout");
      } else {
        con.query(
          "DELETE FROM `prenotazioni` WHERE `prenotazioni`.`id` = ? AND `prenotazioni`.`idprop` = ?",
          [request.body.idpost, risposta[0].id],
          function (err, risposta) {
            response.json("ok");
          }
        );
      }
    }
  );
});
// sistema per creare le prenotazioni
app.post("/api/createprenotazione/", function (request, response) {
  // cerco se i dati esistono nel database
  con.query(
    "SELECT * FROM user WHERE id = ? AND token = ?",
    [request.body.id, request.body.token],
    function (err, risposta) {
      if (err) {
        response.json("errore");
      } else if (risposta.length === 0) {
        // se non esistono restituisco un errore
        response.json("logout");
      } else {
        const prenotazione = {
          idprop: risposta[0].id,
          nome: risposta[0].nome,
          telefono: risposta[0].telefono,
          problematica: request.body.problempren,
          auto: request.body.modelpren,
          data: request.body.datepren,
          stato: "in attesa di accettazione...",
          callert: "",
          allert: "nomsg",
          perc: "",
          ora: request.body.orepren,
        };
        con.query(
          "INSERT INTO prenotazioni SET ?",
          prenotazione,
          function (err, risposta) {
            if (err) {
              response.json("errore");
            } else {
              response.json("ok");
            }
          }
        );
      }
    }
  );
});

//sistema annunci
app.get("/api/annunci/", function (request, response) {
  con.query("SELECT * FROM annunci ", function (err, risposta) {
    response.json(risposta);
  });
}); //sistema per cambiare foto
app.post("/api/changefoto/", function (request, response) {
  //cerco se i dati esistono nel database
  con.query(
    "SELECT * FROM user WHERE id = ? AND token = ?",
    [request.body.id, request.body.token],
    function (err, risposta) {
      if (risposta.length == 0) {
        //se non esistono restituisco un errore
        response.json("logout");
      } else {
        con.query(
          "UPDATE `user` SET `foto` = ? WHERE `user`.`id` = ?",
          [request.body.img, request.body.id],
          function (err, risposta) {
            response.json("ok");
          }
        );
      }
    }
  );
});
app.post("/api/eliminatutto/", function (request, response) {
  con.query(
    "SELECT * FROM user WHERE id = ? AND token = ?",
    [request.body.id, request.body.token],
    function (err, risposta) {
      if (err) {
        console.log(err);
        response.status(500).json("Internal server error");
        return;
      }
      if (risposta.length == 0) {
        response.json("logout");
      } else {
        con.query(
          "DELETE FROM `user` WHERE `user`.`id` = ?",
          request.body.id,
          function (err, risposta) {
            if (err) {
              console.log(err);
              response.status(500).json("Internal server error");
              return;
            }
            con.query(
              "DELETE FROM `prenotazioni` WHERE `prenotazioni`.`idprop` = ?",
              request.body.id,
              function (err, risposta) {
                if (err) {
                  console.log(err);
                  response.status(500).json("Internal server error");
                  return;
                }
                response.json("ok");
              }
            );
          }
        );
      }
    }
  );
});
