import React, { useState } from "react";
import axios from "axios";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [serverResponse, setServerResponse] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const user = { name, email, age };

    axios.post("http://localhost/website/add_user.php", user)
      .then((response) => {
        console.log(response.data.message);
        setServerResponse(response.data.message);
      })
      .catch((error) => {
        console.error("There was an error adding the user!", error);
      });
  };

  return (
    <div>
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value.toLowerCase())} />
        <br /><label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
        <br /><label>Age:</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <br /> 
        <button type="submit">Add User</button>
      </form>
        <p>{serverResponse}</p>
    </div>
  );
}

export default AddUser;
