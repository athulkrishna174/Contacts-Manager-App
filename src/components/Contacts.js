import React, { useEffect, useRef, useState } from "react";
import { Form, Button, Card, Alert, Table, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Contacts() {
  const nameRef = useRef();
  const phnRef = useRef();
  const emailRef = useRef();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState([]);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const userCollection = collection(db, currentUser.email);

  useEffect(() => {
    const getContacts = async () => {
      const data = await getDocs(userCollection);
      setContact(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getContacts();
  }, [userCollection]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await addDoc(userCollection, {
        name: nameRef.current.value,
        phn: phnRef.current.value,
        email: emailRef.current.value,
      });
      nameRef.current.value = "";
      phnRef.current.value = "";
      emailRef.current.value = "";
    } catch {
      setError("Failed to save contact!");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    try {
      setError("");
      setLoading(true);
      const contactDoc = doc(userCollection, id);
      await deleteDoc(contactDoc);
    } catch {
      setError("Failed to delete contact!");
    }
    setLoading(false);
  }

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  return (
    <Container>
      <div>
        <h2 className="text-center bold mb-4">Contacts Manager</h2>
        <Button variant="link" onClick={handleLogout} className="mb-4">
          Log Out
        </Button>
        <Card className="w-100" style={{ maxWidth: "400px" }}>
          <Card.Body>
            <h4 className="text-center mb-4">Add Contact</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            {/* <strong>Email:</strong>{currentUser.email} */}
            <Form onSubmit={handleSubmit} name="form">
              <Form.Group id="name">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" ref={nameRef} required />
              </Form.Group>
              <Form.Group id="phn">
                <Form.Label>Phone No</Form.Label>
                <Form.Control type="text" pattern="[0-9]*" ref={phnRef} required />
              </Form.Group>
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required />
              </Form.Group>
              <Button disabled={loading} className="w-50 mt-4" type="submit">
                Save
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <h3 className="text-center mt-4">My Contacts</h3>
        <Table striped hover size="lg mt-4" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone No.</th>
              <th>email</th>
            </tr>
          </thead>
          <tbody>
            {contact.map((contact, i) => {
              return (
                <tr key={i}>
                  <td>{contact.name}</td>
                  <td>{contact.phn}</td>
                  <td>{contact.email}</td>
                  <td>
                    <Button
                      disabled={loading}
                      onClick={() => {
                        handleDelete(contact.id);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
