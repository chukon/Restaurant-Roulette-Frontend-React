import React, { Component } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { Form, Checkbox, Button } from "semantic-ui-react";

export default class Signup extends Component {
  constructor(props) {
    super(props);

    this._next = this._next.bind(this);
    this._prev = this._prev.bind(this);

    this.state = {
      currentStep: 1,
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      zipcode: "",
      radius: "",
      preferences: [],
      user: "",
      isSignedUp: false
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleSubmit = event => {
    if (this.state.password === this.state.password_confirmation) {
      event.preventDefault();
      fetch("https://restaurant-roulette-backend.herokuapp.com/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          user: {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password_confirmation: this.state.password_confirmation,
            zipcode: this.state.zipcode,
            radius: this.state.radius
          }
        })
      })
        .then(resp => resp.json())
        .then(response => {
          console.log(response);
          localStorage.setItem("user_id", response.user.id);
          localStorage.setItem("jwt", response.jwt);
          this.setState({ user: response.user });
          this.createCuisinePreferences(this.state.user);
          this.getRecentUserInfo();
        });
    } else alert("Passwords don't match - try again!");
  };

  redirect = () => {
    if (this.state.user.cuisine_preferences === 0) {
      alert("Whoops! You didn't select any preferences!");
    } else {
      this.props.history.push("/home");
    }
  };

  createCuisinePreferences = user => {
    this.state.preferences.map((cuisine_id, index) => {
      fetch(
        "https://restaurant-roulette-backend.herokuapp.com/api/cuisine_preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            user_id: user.id,
            cuisine_id: parseInt(cuisine_id, 10)
          })
        }
      )
        .then(resp => resp.json())
        .then(response => {
          this.props.userSignUp(this.state.user);
        });
    });
  };

  getRecentUserInfo = () => {
    fetch(
      `https://restaurant-roulette-backend.herokuapp.com/api/users/${this.state.user.id}`
    )
      .then(resp => resp.json())
      .then(resp => {
        this.setState({ user: resp });
        this.props.userSignUp(resp);
        this.redirect();
      });
    console.log(`success!`, this.state.user);
  };

  handleCheckBoxChange = (event, data) => {
    this.setState({ preferences: data.value });
  };

  _next() {
    let thisStep = this.state.currentStep;
    thisStep = thisStep >= 1 ? 2 : thisStep + 1;
    this.setState({
      currentStep: thisStep
    });
  }

  _prev() {
    let thisStep = this.state.currentStep;
    thisStep = thisStep <= 1 ? 1 : thisStep - 1;
    this.setState({
      currentStep: thisStep
    });
  }

  get previousButton() {
    let currentStep = this.state.currentStep;
    if (currentStep !== 1) {
      return (
        <small
          style={{ color: "#5C5932" }}
          onClick={this._prev}
          className="link"
        >
          <b>Go back.</b>
        </small>
      );
    }
    return null;
  }

  get nextButton() {
    let currentStep = this.state.currentStep;
    if (currentStep === 1) {
      return <Button onClick={this._next}>Next</Button>;
    }
    return null;
  }

  get submitButton() {
    if (this.state.currentStep === 2) {
      return (
        <Button type="submit">Create Account</Button>
        // <input
        //   type="submit"
        //   value="Create Account"
        //   className="button"
        //   style={{ width: "56%", marginLeft: "auto", marginRight: "auto" }}
        // />
      );
    }
    return null;
  }

  render() {
    console.log(this.state);
    return (
      <React.Fragment>
        <div className="pb-2 mt-4 mb-2" align="center">
          <h1 className="header" style={{ fontSize: "75px" }}>
            Restaurant Roulette
          </h1>
        </div>
        <Form
          onSubmit={this.handleSubmit}
          style={{ width: "fit-content", margin: "0 auto" }}
        >
          <Step1
            currentStep={this.state.currentStep}
            handleChange={this.handleChange}
            name={this.state.name}
            email={this.state.email}
            password={this.state.password}
            password_confirmation={this.state.password_confirmation}
          />
          <Step2
            handleCheckBoxChange={this.handleCheckBoxChange}
            cuisines={this.props.cuisines}
            preferences={this.state.preferences}
            currentStep={this.state.currentStep}
            handleChange={this.handleChange}
            zipcode={this.state.zipcode}
            radius={this.state.radius}
          />
          <div
            style={{
              marginLeft: "30%",
              marginRight: "auto",
              padding: "15px"
            }}
          >
            {this.nextButton}
            {this.submitButton}
            <br />
            {this.previousButton}
          </div>
        </Form>
      </React.Fragment>
    );
  }
}
