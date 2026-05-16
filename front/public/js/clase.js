async function createPost(claseId) {
    const contenido = document.getElementById('postContent')?.value.trim();

    if (!validateNotEmpty(contenido, 'El contenido')) return;

    showLoading('Publicando anuncio', 'Por favor espere...');

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ contenido, clase_id: claseId })
        });

        if (response.ok) {
            await showSuccess('¡Anuncio publicado!', 'El anuncio ha sido publicado correctamente');
            location.reload();
        } else {
            showError('Error al publicar', 'No se pudo publicar el anuncio');
        }
    } catch (error) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}

function switchSection(section) {
    const sections = ['tasks', 'personas', 'rendimiento'];

    sections.forEach(name => {
        const el = document.getElementById(`section${name.charAt(0).toUpperCase() + name.slice(1)}`);
        if (el) {
            if (name === section) {
                el.classList.remove('d-none');
            } else {
                el.classList.add('d-none');
            }
        }
    });

    const buttons = {
        tasks: 'tabTasksBtn',
        personas: 'tabPersonasBtn',
        rendimiento: 'tabRendimientoBtn'
    };

    Object.entries(buttons).forEach(([name, id]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.toggle('active', name === section);
        }
    });
}

function removeStudent(classId, studentId, studentName) {
    showConfirm(
        '¿Dar de baja alumno?',
        `¿Estás seguro de que deseas dar de baja a ${studentName}?`,
        'Sí, dar de baja',
        'Cancelar'
    ).then(async result => {
        if (!result.isConfirmed) return;

        showLoading('Dando de baja alumno', 'Por favor espere...');

        try {
            const response = await fetch(`/api/classes/${classId}/students/${studentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await showSuccess('Alumno dado de baja', `${studentName} ha sido dado de baja correctamente`);
                location.reload();
            } else {
                const errorData = await response.json().catch(() => null);
                showError('Error al dar de baja', errorData?.error || 'No se pudo dar de baja al alumno');
            }
        } catch (err) {
            showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
    });
}

function actualizarRendimientoIndividual() {
    const selector = document.getElementById('studentSelector');
    if (!selector) return;

    const studentId = selector.value;
    const performance = window.studentPerformanceMap?.[studentId];

    if (!studentId) {
        document.getElementById('studentPerformanceSection')?.classList.add('d-none');
        return;
    }

    if (!performance) {
        showError('Datos no encontrados', 'No se encontraron datos para este alumno');
        return;
    }

    document.getElementById('studentAverage').textContent = performance.promedioCalificacion;
    document.getElementById('studentDelivered').textContent = performance.tareasEntregadas;
    document.getElementById('studentDeliveryPercent').textContent = `${performance.porcentajeEntrega}%`;
    document.getElementById('studentGraded').textContent = performance.tareasCalificadas;
    document.getElementById('studentOnTime').textContent = performance.entregadasAtiempo;
    document.getElementById('studentLate').textContent = performance.entregadasTarde;
    document.getElementById('studentNotDelivered').textContent = performance.noEntregadas;

    const totalTareas = performance.entregadasAtiempo + performance.entregadasTarde + performance.noEntregadas;
    const onTimePercent = totalTareas > 0 ? ((performance.entregadasAtiempo / totalTareas) * 100).toFixed(1) : 0;
    const latePercent = totalTareas > 0 ? ((performance.entregadasTarde / totalTareas) * 100).toFixed(1) : 0;
    const notDeliveredPercent = totalTareas > 0 ? ((performance.noEntregadas / totalTareas) * 100).toFixed(1) : 0;

    document.getElementById('studentOnTimeBar').style.width = `${onTimePercent}%`;
    document.getElementById('studentLateBar').style.width = `${latePercent}%`;
    document.getElementById('studentNotDeliveredBar').style.width = `${notDeliveredPercent}%`;

    document.getElementById('studentPerformanceSection')?.classList.remove('d-none');
}

document.addEventListener('DOMContentLoaded', () => {
    const dataElement = document.getElementById('studentPerformanceData');
    if (dataElement) {
        try {
            window.studentPerformanceMap = JSON.parse(dataElement.textContent || '{}');
        } catch (err) {
            window.studentPerformanceMap = {};
        }
    } else {
        window.studentPerformanceMap = {};
    }

    switchSection('tasks');
});

async function deletePost(postId) {
    showConfirm(
        '¿Eliminar anuncio?',
        '¿Estás seguro de que deseas eliminar este anuncio?',
        'Sí, eliminar',
        'Cancelar'
    ).then(async (result) => {
        if (!result.isConfirmed) return;

        showLoading('Eliminando anuncio', 'Por favor espere...');

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await showSuccess('Anuncio eliminado', 'El anuncio ha sido eliminado correctamente');
                location.reload();
            } else {
                const errorData = await response.json().catch(() => null);
                showError('Error al eliminar', errorData?.error || 'No se pudo eliminar el anuncio');
            }
        } catch (error) {
            showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
    });
}

async function deleteAssignment(assignmentId) {
    showConfirm(
        '¿Eliminar tarea?',
        '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.',
        'Sí, eliminar',
        'Cancelar'
    ).then(async (result) => {
        if (!result.isConfirmed) return;

        showLoading('Eliminando tarea', 'Por favor espere...');

        try {
            const response = await fetch(`/api/assignments/${assignmentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await showSuccess('Tarea eliminada', 'La tarea ha sido eliminada correctamente');
                location.reload();
            } else {
                const errorData = await response.json().catch(() => null);
                showError('Error al eliminar', errorData?.error || 'No se pudo eliminar la tarea');
            }
        } catch (error) {
            showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
    });
}

async function uploadClassBanner(classId, event) {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!validateFileType(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) return;
    if (!validateFileSize(file, 5)) return;

    showLoading('Subiendo banner', 'Por favor espere...');

    const formData = new FormData();
    formData.append('banner', file);

    try {
        const response = await fetch(`/api/classes/${classId}/banner`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();
        if (response.ok) {
            const bannerDiv = event.target.closest('.p-5');
            if (bannerDiv) {
                bannerDiv.style.backgroundImage = `url('${result.url}')`;
            }
            await showSuccess('Banner actualizado', 'El banner se ha actualizado correctamente');
        } else {
            showError('Error al subir', result.error || 'No se pudo subir el banner');
        }
    } catch (error) {
        showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
}