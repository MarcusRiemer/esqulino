<validate-input
    icon="key"
    [(value)]="signInData.password">

    <input #inputRef 
      type="password"
      class="form-control"
      placeholder="Password"
      required>
</validate-input>
