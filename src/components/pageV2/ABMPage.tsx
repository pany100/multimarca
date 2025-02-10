import React, { useState } from "react";
import { CrudAction } from "../formV2/constants";
import FormModal from "../tableV2/FormModal";

type Props = {
  table: React.ComponentType<any>;
  form: React.ComponentType<any>;
  crudActions: CrudAction[];
};

function ABMPage({ table: Table, form: Form, crudActions }: Props) {
  const shouldShowAdd = crudActions.includes(CrudAction.ADD);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const tableProps = {
    ...(shouldShowAdd && {
      ctaCb: () => {
        setIsAddModalOpen(true);
      },
    }),
  };
  return (
    <div>
      <Table {...tableProps} />
      {shouldShowAdd && (
        <FormModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        >
          <Form onCancel={() => setIsAddModalOpen(false)} />
        </FormModal>
      )}
    </div>
  );
}

export default ABMPage;
