import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/esm/Container";
import Table from "react-bootstrap/esm/Table";
import { useHistory } from "react-router-dom";
import { useQuery } from "../hooks";
import { IShareholder, IOwnership } from "../models/models";

export const Shareholder = () => {
  const query = useQuery();
  const history = useHistory();

  const [shareholderId, setShareholderId] = useState<string>();
  const [shareholder, setShareholder] = useState<IShareholder>();
  const [ownerships, setOwnerships] = useState<IOwnership[]>([]);

  useEffect(() => {
    const _id = query.get("_id");
    if (_id) setShareholderId(_id);
  }, [query]);

  useEffect(() => {
    if (shareholderId) {
      fetch(`/api/shareholder?_id=${shareholderId}`).then(async (res) => {
        const s = await res.json();
        setShareholder(s);
      });
    }
  }, [shareholderId]);

  useEffect(() => {
    if (shareholder) {
      fetch(`/api/ownerships?shareholderId=${shareholder.id}`).then(
        async (res) => {
          const o = await res.json();
          setOwnerships(o);
        }
      );
    }
  }, [shareholder]);

  return (
    <>
      <Container>
        <p className="h4 my-4">Aksjer eid av {shareholder?.name}</p>
        {ownerships && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Selskap</th>
                <th>Antall aksjer</th>
                <th>Eierandel</th>
              </tr>
            </thead>
            <tbody>
              {ownerships &&
                ownerships.map((o) => (
                  <tr
                    key={o._id}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      history.push(`/company?_id=${o.company?._id}`)
                    }
                  >
                    <td>{o.company?.name}</td>
                    <td>{o.stocks.toLocaleString()}</td>
                    <td>
                      {o.company?.stocks &&
                        ((o.stocks / o.company.stocks) * 100).toFixed(2)}
                      %
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
        {(!ownerships || ownerships.length === 0) && shareholderId && (
          <p>Laster inn aksjonærdata...</p>
        )}
      </Container>
    </>
  );
};
