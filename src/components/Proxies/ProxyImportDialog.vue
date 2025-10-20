<script setup lang="ts">
import { computed } from 'vue';
import i18n from '@/locales/i18n';

const locale = i18n.global.t;

const props = defineProps<{
    modelValue: boolean;
    text: string;
    isImporting: boolean;
    canImport: boolean;
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void;
    (event: 'update:text', value: string): void;
    (event: 'confirm'): void;
    (event: 'cancel'): void;
}>();

const dialogModel = computed({
    get: () => props.modelValue,
    set: (value: boolean) => {
        if (!value && props.isImporting)
            return;

        emit('update:modelValue', value);
    }
});

const textModel = computed({
    get: () => props.text,
    set: (value: string) => emit('update:text', value)
});

function handleCancel(): void {
    if (props.isImporting)
        return;

    emit('cancel');
    emit('update:modelValue', false);
}

function handleConfirm(): void {
    if (!props.canImport || props.isImporting)
        return;

    emit('confirm');
}
</script>

<template>
    <v-dialog v-model="dialogModel" max-width="640">
        <v-card>
            <v-card-title>{{ locale('PROXY_IMPORT_TITLE') }}</v-card-title>
            <v-card-text>
                <div class="text-body-2 text-disabled mb-3">{{ locale('PROXY_IMPORT_DESC') }}</div>
                <v-textarea v-model="textModel" :label="locale('PROXY_IMPORT_LABEL')" variant="outlined" auto-grow
                    rows="6" :disabled="isImporting" />
            </v-card-text>
            <v-card-actions class="justify-end ga-2">
                <v-btn variant="text" class="text-transform-none" :disabled="isImporting" @click="handleCancel">
                    {{ locale('CANCEL') }}
                </v-btn>
                <v-btn color="highlight" class="text-transform-none" :disabled="!canImport" :loading="isImporting"
                    @click="handleConfirm">
                    {{ locale('PROXY_IMPORT_CONFIRM') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

