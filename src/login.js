// src/login.js

function LoginPage() {
  const form = `
    <h2>Login</h2>
    <form>
      <label>Username:</label><br />
      <input type="text" /><br /><br />
      <label>Password:</label><br />
      <input type="password" /><br /><br />
      <button type="submit">Login</button>
    </form>
  `;

  document.body.innerHTML = form;
}

// jalankan langsung kalau file dipanggil
LoginPage();
