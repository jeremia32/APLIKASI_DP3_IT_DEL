// import React from "react";
// import Pertanyaan from "../components/Pertanyaan";

// const App = () => {
//   return (
//     <div>
//       <h2>buat Pertanyaan </h2>
//       <Pertanyaan />
//     </div>
//   );
// };

// export default App;


// PertanyaanPage.jsx
import React from "react";
import Pertanyaan from "../components/Pertanyaan";
import Navbaradmin from "../components/Navbaradmin"
const PertanyaanPage = () => {
  return (
    <div>
      <Navbaradmin />
      <Pertanyaan />
    </div>
  );
};

export default PertanyaanPage;

