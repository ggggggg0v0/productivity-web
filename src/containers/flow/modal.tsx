import { Field, Form, Formik } from "formik";

import {
  // Layout
  Flex,
  // Form
  IconButton,
  Button,
  // Modal
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Textarea,
  ModalFooter,
  // Form
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import { DeleteIcon } from "@chakra-ui/icons";
import React from "react";

export interface FormValue {
  content: string;
}

export default function ({ isOpen, handleClose, handleSave, selected }) {
  function handleSubmit(formValue: FormValue, actions) {
    handleSave(formValue);
    actions.setSubmitting(false);
  }

  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
    >
      <ModalOverlay />
      <Formik
        initialValues={{ content: selected?.content }}
        onSubmit={handleSubmit}
      >
        {(props) => (
          <Form>
            <ModalContent>
              <ModalHeader>Edit</ModalHeader>
              <ModalBody>
                <Field name="content">
                  {({ field, form }) => (
                    <FormControl>
                      <FormLabel>Content</FormLabel>
                      <Textarea {...field} placeholder="Please enter content" />
                    </FormControl>
                  )}
                </Field>
              </ModalBody>

              <ModalFooter justifyContent="space-between">
                <IconButton
                  icon={<DeleteIcon color="red.500" />}
                  aria-label={""}
                />
                <Flex>
                  <Button mr={3} onClick={handleClose} variant="ghost">
                    Close
                  </Button>
                  <Button
                    mr={3}
                    type="submit"
                    isLoading={props.isSubmitting}
                    colorScheme="blue"
                  >
                    Save
                  </Button>
                </Flex>
              </ModalFooter>
            </ModalContent>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
