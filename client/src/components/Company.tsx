import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/esm/Container";
import Table from "react-bootstrap/esm/Table";
import { useHistory } from "react-router";
import { useQuery } from "../hooks";
import { IOwnership, IShareholder } from "../models/models";

export const Company = () => {
  const query = useQuery();
  const history = useHistory();
  const [error, setError] = useState<string>();

  const [companyId, setCompanyId] = useState<string>();
  const [company, setCompany] = useState<IShareholder>();
  const [ownerships, setOwnerships] = useState<IOwnership[]>([]);

  useEffect(() => {
    const _id = query.get("_id");
    if (_id) setCompanyId(_id);
  }, [query]);

  useEffect(() => {
    if (companyId) {
      fetch(`/api/company?_id=${companyId}`).then(async (res) => {
        const c = await res.json();
        setCompany(c);
      });
    }
  }, [companyId]);

  useEffect(() => {
    if (company) {
      fetch(`/api/ownerships?orgnr=${company.orgnr}`).then(async (res) => {
        const o = await res.json();
        if (o?.error) {
          setError(o.error);
          setOwnerships([]);
        } else setOwnerships(o);
      });
    }
  }, [company]);

  return (
    <>
      <Container>
        <p className="h4 my-4">Aksjonærer i {company?.name}</p>
        {ownerships && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Aksjonær</th>
                <th>Landkode</th>
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
                      history.push(`/shareholder?_id=${o.shareholder?._id}`)
                    }
                  >
                    <td>{o.shareholder?.name}</td>
                    <td>{o.shareholder?.countryCode}</td>
                    <td>{o.stocks.toLocaleString()}</td>
                    <td>
                      {company?.stocks &&
                        ((o.stocks / company.stocks) * 100).toFixed(2)}
                      %
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
        {(!ownerships || ownerships.length === 0) && !error && companyId && (
          <p>Laster inn aksjonærdata...</p>
        )}
        {error && <p>Åh, nei! Noe ser ut til å ha gått galt..:/</p>}
      </Container>
    </>
  );
};
