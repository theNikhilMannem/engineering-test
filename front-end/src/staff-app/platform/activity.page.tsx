import React, { useEffect } from "react"
import styled from "styled-components"
import { Spacing } from "shared/styles/styles"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"

export const ActivityPage: React.FC = () => {

  const [getActivities, data, loadState] = useApi<{ activity: Activity[] }>({ url: "get-activities" })

  useEffect(() => {
    getActivities()
  }, [getActivities])

  return (
  <S.Container>
    {loadState === "loading" && (
      <CenteredContainer>
        <FontAwesomeIcon icon="spinner" size="2x" spin />
      </CenteredContainer>
    )}
    
    {
      loadState === "loaded" && (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Present</TableCell>
                <TableCell>Late</TableCell>
                <TableCell>Absent</TableCell>
                <TableCell>Unmarked</TableCell>
                <TableCell>Completed At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.activity.map(s => (
                <TableRow key={s.entity.id}>
                  <TableCell>{s.entity.name}</TableCell>
                  <TableCell>{s.entity.student_roll_states.filter(st => st.roll_state === "present").length}</TableCell>
                  <TableCell>{s.entity.student_roll_states.filter(st => st.roll_state === "late").length}</TableCell>
                  <TableCell>{s.entity.student_roll_states.filter(st => st.roll_state === "absent").length}</TableCell>
                  <TableCell>{s.entity.student_roll_states.filter(st => st.roll_state === "unmark").length}</TableCell>
                  <TableCell>{s.entity.completed_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    }

    {loadState === "error" && (
      <CenteredContainer>
        <div>Failed to load</div>
      </CenteredContainer>
    )}
  </S.Container>)
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
  `,
}
