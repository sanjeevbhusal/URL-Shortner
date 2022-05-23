import { nanoid } from "nanoid";
import { getDatabase, child, ref, set, get } from "firebase/database";
import { isWebUri } from "valid-url";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useState } from "react";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAsO2unjUqnpnpiXSc_nhqFf3TV7hKNGoY",
  authDomain: "react-flask-fb44a.firebaseapp.com",
  projectId: "react-flask-fb44a",
  storageBucket: "react-flask-fb44a.appspot.com",
  messagingSenderId: "993007929300",
  appId: "1:993007929300:web:c99a1025a513455fd2f841",
  measurementId: "G-11QKJZTD8S",
};

export const app = initializeApp(firebaseConfig);

const db = getDatabase();

const data = {
  longUrl: "",
  generatedUrl: "",
  preferedAlias: "",
  loading: false,
  errors: {},
  toolTipMessage: "Copy to Clipboard",
};

export const Form = () => {
  const [formData, setFormData] = useState(data);

  const checkKeyExist = async (key) => {
    const dbRef = ref(getDatabase());
    try {
      return get(child(dbRef, "/" + key));
    } catch (err) {
      return false;
    }
  };

  const validateFormInput = async () => {
    console.log("Validating Input");
    let errors = {};

    if (formData.longUrl.length === 0) {
      errors.longUrl = "This field cannot be Empty.";
    } else if (!isWebUri(formData.longUrl)) {
      errors.longUrl = "Please Enter a Valid Url.";
    }

    if (formData.preferedAlias !== "") {
      if (formData.preferedAlias.length > 7) {
        errors.preferedAlias = "The length of this field cannot be more than 7";
      } else if (formData.preferedAlias.indexOf(" ") !== -1) {
        errors.preferedAlias = "You cannot have spaces in this field.";
      }
      let keyExists = await checkKeyExist(formData.preferedAlias);
      if (keyExists.exists() & !("preferedAlias" in errors)) {
        errors.preferedAlias =
          "This Alias already Exist. Please Enter a new one.";
      }
    }
    setFormData((prevState) => ({ ...prevState, errors: errors }));

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        errors: errors,
        loading: false,
      }));
      return false;
    }

    setFormData((prevState) => ({ ...prevState, errors: errors }));
    return true;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData((prevState) => ({
      ...prevState,
      loading: true,
      generatedUrl: "",
      errors: {},
    }));

    const isFormValid = await validateFormInput();

    if (!isFormValid) {
      return;
    }

    let generatedKey = nanoid(5);
    if (formData.preferedAlias) {
      generatedKey = formData.preferedAlias;
    }
    let generatedUrl = "mini-linker.herokuapp.com/" + generatedKey;

    set(ref(db, "/" + generatedKey), {
      generatedKey,
      generatedUrl: generatedUrl,
      preferedAlias: formData.preferedAlias,
      longUrl: formData.longUrl,
    })
      .then((result) => {
        return setFormData((prevState) => ({
          ...prevState,
          generatedUrl: generatedUrl,
          loading: false,
        }));
      })
      .catch((err) => console.log(err));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formData.generatedUrl);
    setFormData({ ...formData, toolTipMessage: "Copied" });
  };

  const hasError = (key) => {
    const error = key in formData.errors;
    return error;
  };

  return (
    <div className="container">
      {console.log({ formData })}
      <form>
        <h3>URl Shortner</h3>
        <div className="form_group">
          <label>Enter Your Long URL</label>
          <input
            id="longUrl"
            onChange={handleChange}
            value={formData.longUrl}
            type="url"
            required
            placeholder="htts://www."
            className={
              hasError("longUrl") ? "form-control is-invalid" : "form-control"
            }
          ></input>
        </div>
        <div
          className={hasError("longUrl") ? "text-danger" : "visually-hidden"}
        >
          {formData.errors.longUrl}
        </div>
        <div className="form_group">
          <label>Your Short URL</label>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text">
                mini-linker.herokuapp.com
              </span>
            </div>
            <input
              id="preferedAlias"
              onChange={handleChange}
              value={formData.preferedAlias}
              type="text"
              placeholder="eg. 3gaj4 (Optional)"
              className={
                hasError("preferedAlias")
                  ? "form-control is-invalid"
                  : "form-control"
              }
            ></input>
          </div>
          <div
            className={
              hasError("preferedAlias") ? "text-danger" : "visually-hidden"
            }
          >
            {formData.errors.preferedAlias}
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>
          {formData.loading ? (
            <div>
              <span
                className="spinner-border spinner-border-sm"
                aria-hidden="true"
              ></span>
            </div>
          ) : (
            <div>
              <span
                className="visually-hidden spinner-border spinner-border-sm"
                aria-hidden="true"
              ></span>
              <span> Mini Linkit </span>
            </div>
          )}
        </button>

        {formData.generatedUrl === "" ? (
          <div></div>
        ) : (
          <div className="generatedUrl">
            <span> Your Generated Url is </span>
            <div className="input-group mb-3">
              <input
                disabled
                type="text"
                value={formData.generatedUrl}
                className="form-control"
                placeholder="Receipents Username"
                aria-label="Recipents Uername"
                aria-describedby="basic-addon2"
              ></input>
              <OverlayTrigger
                key={"top"}
                placement={"top"}
                overlay={
                  <Tooltip id={`tooltip-${"top"}`}>
                    {formData.toolTipMessage}{" "}
                  </Tooltip>
                }
              >
                <button
                  onClick={copyToClipboard}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Tooltip on Top"
                  className="btn btn-outline-secondary"
                >
                  Copy
                </button>
              </OverlayTrigger>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
