process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const axios = require("axios");

const cookie =
  "express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall4WWpGbU1qUmlOamcxT1RobU5EZ3pNMll4WlRFd1pTSXNJbVZ0WVdsc0lqb2ljMjl0WlhSb2FXNW5RSE52YldWMGFHbHVaeTVqYjIwaUxDSnBZWFFpT2pFMk16a3dOVEU0TlRaOS5WdF9lVU9xVVFLUV9vSFFIa0xqU1BuRlNRSmMxV0hTTV9jUmFlaFRadTdVIn0=";

const doRequest = async () => {
  const { data } = await axios.post(
    `https://ticketing.dev/api/tickets`,
    {
      title: "ticket",
      price: 5,
    },
    {
      headers: {
        cookie,
      },
    }
  );

  await axios.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      title: "ticket",
      price: 10,
    },
    {
      headers: {
        cookie,
      },
    }
  );

  await axios.put(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      title: "ticket",
      price: 15,
    },
    {
      headers: {
        cookie,
      },
    }
  );

  console.log("Request complete");
};

(async () => {
  for (let i = 0; i < 200; i++) {
    doRequest();
  }
})();
