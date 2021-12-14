import axios from "axios";

const getData = ({ req }) => {
  try {
    console.log("client 1");
    if (typeof window === "undefined") {
      // We are on the server

      return axios.create({
        baseURL:
          "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
        headers: req.headers,
      });
    } else {
      // We must be on the browser
      return axios.create({
        baseUrl: "/",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export default getData;
